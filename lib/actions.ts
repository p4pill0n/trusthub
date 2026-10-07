"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { isValid, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  calculateSecurityScore,
  evidenceTypeLabel,
  isCompleteResponseSet,
  QUESTIONNAIRE_EVIDENCE_TYPES,
  type QuestionnaireAnswer,
  type QuestionnaireEvidenceItem,
  type QuestionnaireEvidenceType,
} from "@/lib/questionnaire";
import { computeNextReviewDate, deriveResidualRisk, validatePolicyInput } from "@/lib/policy";
import { getTprmPolicy, getVendorActivity, getVendorById, getExperts } from "@/lib/queries";
import { hasDocumentedEvidence } from "@/lib/remediation-status";
import {
  DATA_CLASSIFICATIONS,
  DATA_TYPES,
  ENTITY_OPTIONS,
  RISK_LEVELS,
  VENDOR_STATUSES,
  VENDOR_TYPES,
} from "@/lib/constants";
import { todayIsoDate } from "@/lib/utils";
import type {
  RemediationPriority,
  RemediationStatus,
  VendorStatus,
  TprmPolicyInput,
  BroadcastType,
  BroadcastAudience,
  InherentRisk,
  BroadcastRecipientStatus,
  IncidentSeverity,
  IncidentStatus,
  ConnectionDirection,
  ConnectionType,
} from "@/types";

type Failure = { ok: false; error: string };

const EVIDENCE_TYPE_SET = new Set<string>(QUESTIONNAIRE_EVIDENCE_TYPES.map((t) => t.value));

function sanitizeQuestionnaireEvidence(
  evidence: QuestionnaireEvidenceItem[] | null | undefined
): QuestionnaireEvidenceItem[] {
  if (!Array.isArray(evidence)) return [];

  return evidence
    .filter((item) => item && typeof item.id === "string" && EVIDENCE_TYPE_SET.has(item.type))
    .slice(0, 10)
    .map((item) => {
      const type = item.type as QuestionnaireEvidenceType;
      const notes =
        typeof item.notes === "string" && item.notes.trim() ? item.notes.trim().slice(0, 2000) : null;
      return {
        id: item.id.slice(0, 80),
        type,
        label:
          typeof item.label === "string" && item.label.trim()
            ? item.label.trim().slice(0, 200)
            : evidenceTypeLabel(type),
        notes,
        file_name:
          typeof item.file_name === "string" && item.file_name.trim()
            ? item.file_name.trim().slice(0, 260)
            : null,
        file_path:
          typeof item.file_path === "string" && item.file_path.trim()
            ? item.file_path.trim().slice(0, 500)
            : null,
        file_url:
          typeof item.file_url === "string" && item.file_url.trim()
            ? item.file_url.trim().slice(0, 1000)
            : null,
      };
    });
}

function fail(error: string): Failure {
  return { ok: false, error };
}

const NOT_SAVED =
  "The change was not saved. The record may have been removed, or write permission is missing.";

/** Every page reads shared vendor data, so refresh the whole app after any write. */
function revalidateApp() {
  revalidatePath("/", "layout");
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isValidDateString(value: string | null | undefined): boolean {
  return Boolean(value) && isValid(parseISO(value as string));
}

const REMEDIATION_PRIORITIES: RemediationPriority[] = ["Low", "Medium", "High", "Critical"];
const REMEDIATION_STATUSES: RemediationStatus[] = ["Open", "In Progress", "Closed"];
const INCIDENT_SEVERITIES: IncidentSeverity[] = ["Low", "Medium", "High", "Critical"];
const INCIDENT_STATUSES: IncidentStatus[] = ["Open", "Resolved"];
const CONNECTION_DIRECTIONS: ConnectionDirection[] = ["Inbound", "Outbound", "Bidirectional"];
const CONNECTION_TYPES: ConnectionType[] = ["API", "SFTP", "VPN", "Direct Link", "Portal"];
const BROADCAST_RECIPIENT_STATUSES: BroadcastRecipientStatus[] = [
  "Compliant",
  "Not Compliant",
  "Ongoing",
];

async function getActiveVendorOrError(vendorId: string) {
  const vendor = await getVendorById(vendorId);
  if (!vendor) return { vendor: null, error: "Vendor not found." };
  if (vendor.status === "Offboarded") {
    return { vendor: null, error: `${vendor.name} is offboarded.` };
  }
  return { vendor, error: null };
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

type VendorInput = {
  name: string;
  entity_name: string;
  type: string;
  datacontact_name: string;
  contact_email: string;
  business_referent_name?: string | null;
  business_referent_email?: string | null;
  data_type: string;
  data_classification: string;
  inherent_risk: string;
  residual_risk: string;
  status: VendorStatus;
  last_review_date?: string | null;
};

function validateVendorInput(data: VendorInput): string | null {
  if (!data.name.trim() || !data.datacontact_name.trim() || !data.contact_email.trim()) {
    return "Name, contact, and email are required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email.trim())) {
    return "Enter a valid contact email.";
  }
  const businessEmail = data.business_referent_email?.trim();
  if (businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
    return "Enter a valid business referent email.";
  }
  if (!ENTITY_OPTIONS.includes(data.entity_name as never)) return "Select a valid entity.";
  if (!VENDOR_TYPES.includes(data.type as never)) return "Select a valid vendor type.";
  if (!DATA_TYPES.includes(data.data_type as never)) return "Select a valid data type.";
  if (!DATA_CLASSIFICATIONS.includes(data.data_classification as never)) {
    return "Select a valid data classification.";
  }
  if (!RISK_LEVELS.includes(data.inherent_risk as never)) return "Select a valid inherent risk.";
  if (!RISK_LEVELS.includes(data.residual_risk as never)) return "Select a valid residual risk.";
  if (!VENDOR_STATUSES.includes(data.status)) return "Select a valid status.";
  if (data.last_review_date && !isValidDateString(data.last_review_date)) {
    return "Last review date is invalid.";
  }
  if (data.last_review_date && data.last_review_date > todayIsoDate()) {
    return "Last review date cannot be in the future.";
  }
  return null;
}

async function toVendorRow(data: VendorInput) {
  const policy = await getTprmPolicy();
  const lastReview = data.last_review_date || null;
  return {
    name: data.name.trim(),
    entity_name: data.entity_name,
    type: data.type,
    datacontact_name: data.datacontact_name.trim(),
    contact_email: data.contact_email.trim(),
    business_referent_name: blankToNull(data.business_referent_name),
    business_referent_email: blankToNull(data.business_referent_email),
    data_type: data.data_type,
    data_classification: data.data_classification,
    inherent_risk: data.inherent_risk,
    residual_risk: data.residual_risk,
    status: data.status,
    last_review_date: lastReview,
    next_review_date: computeNextReviewDate(lastReview, data.inherent_risk, policy, data.status),
  };
}

export async function createVendor(data: VendorInput) {
  const invalid = validateVendorInput(data);
  if (invalid) return fail(invalid);

  const { data: created, error } = await supabase
    .from("vendors")
    .insert(await toVendorRow(data))
    .select("id")
    .single();
  if (error) return fail(error.message);

  revalidateApp();
  return { ok: true as const, id: created.id as string };
}

export async function updateVendor(id: string, data: VendorInput) {
  const invalid = validateVendorInput(data);
  if (invalid) return fail(invalid);

  const { data: updated, error } = await supabase
    .from("vendors")
    .update(await toVendorRow(data))
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!updated?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

export async function offboardVendor(id: string) {
  const { data, error } = await supabase
    .from("vendors")
    .update({ status: "Offboarded", next_review_date: null })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

export async function loadVendorProfile(vendorId: string) {
  try {
    const [vendor, experts] = await Promise.all([getVendorById(vendorId), getExperts()]);
    if (!vendor) return fail("Vendor not found.");
    return { ok: true as const, vendor, experts };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load vendor.");
  }
}

export async function loadVendorActivity(vendorId: string) {
  try {
    return { ok: true as const, activity: await getVendorActivity(vendorId) };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load vendor activity.");
  }
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export async function launchAssessment(vendorId: string) {
  const { error: vendorError } = await getActiveVendorOrError(vendorId);
  if (vendorError) return { ...fail(vendorError), existingToken: null };

  const { data: existing, error: existingError } = await supabase
    .from("assessments")
    .select("id, questionnaire_token")
    .eq("vendor_id", vendorId)
    .in("status", ["Pending", "In Progress"])
    .is("completed_at", null)
    .limit(1);

  if (existingError) return { ...fail(existingError.message), existingToken: null };

  if (existing && existing.length > 0) {
    return {
      ...fail("This vendor already has an open assessment. You can copy the existing questionnaire link below."),
      existingToken: (existing[0].questionnaire_token as string | null) ?? null,
    };
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      vendor_id: vendorId,
      launched_at: new Date().toISOString(),
      status: "Pending",
      questionnaire_token: randomUUID(),
      assessor_notes: "Third-party security risk questionnaire sent to vendor.",
    })
    .select("id, questionnaire_token")
    .single();

  if (error) return { ...fail(error.message), existingToken: null };

  revalidateApp();
  return { ok: true as const, id: data.id as string, token: data.questionnaire_token as string };
}

export async function startQuestionnaire(token: string) {
  const { error } = await supabase
    .from("assessments")
    .update({ status: "In Progress" })
    .eq("questionnaire_token", token)
    .eq("status", "Pending")
    .is("completed_at", null);

  if (error) return fail(error.message);
  revalidateApp();
  return { ok: true as const };
}

export async function submitQuestionnaire(
  token: string,
  responses: Record<string, QuestionnaireAnswer>,
  evidence: QuestionnaireEvidenceItem[] = []
) {
  if (!isCompleteResponseSet(responses)) {
    return fail("Please answer every question before submitting.");
  }

  const { data: assessment, error: lookupError } = await supabase
    .from("assessments")
    .select("id, vendor_id, status, completed_at, vendors(status, inherent_risk)")
    .eq("questionnaire_token", token)
    .maybeSingle();

  if (lookupError) return fail(lookupError.message);
  if (!assessment) return fail("This questionnaire link is no longer valid.");
  if (assessment.completed_at || assessment.status === "Completed") {
    return fail("This questionnaire has already been submitted.");
  }

  const vendor = assessment.vendors as unknown as {
    status: VendorStatus;
    inherent_risk: InherentRisk;
  } | null;
  if (!vendor || vendor.status === "Offboarded") {
    return fail("This questionnaire is no longer accepting responses.");
  }

  const riskScore = calculateSecurityScore(responses);
  const completedAt = new Date().toISOString();
  const sanitizedEvidence = sanitizeQuestionnaireEvidence(evidence);

  const { data: updated, error } = await supabase
    .from("assessments")
    .update({
      responses,
      risk_score: riskScore,
      status: "Completed",
      completed_at: completedAt,
      evidence: sanitizedEvidence,
    })
    .eq("id", assessment.id)
    .is("completed_at", null)
    .in("status", ["Pending", "In Progress"])
    .select("id");

  if (error) return fail(error.message);
  if (!updated?.length) return fail("This questionnaire has already been submitted.");

  const policy = await getTprmPolicy();
  const reviewDate = todayIsoDate();
  const nextStatus: VendorStatus = vendor.status === "Under Review" ? "Active" : vendor.status;
  const { error: vendorError } = await supabase
    .from("vendors")
    .update({
      last_review_date: reviewDate,
      next_review_date: computeNextReviewDate(reviewDate, vendor.inherent_risk, policy, nextStatus),
      residual_risk: deriveResidualRisk(vendor.inherent_risk, riskScore),
      status: nextStatus,
    })
    .eq("id", assessment.vendor_id);

  if (vendorError) return fail(vendorError.message);

  revalidateApp();
  return { ok: true as const, riskScore };
}

export async function deleteAssessment(id: string) {
  const { data, error } = await supabase.from("assessments").delete().eq("id", id).select("id");

  if (error) return fail(error.message);
  if (!data?.length) {
    return fail("Could not delete this assessment. It may already be gone, or delete permission is missing.");
  }

  revalidateApp();
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Remediations
// ---------------------------------------------------------------------------

export async function createRemediation(data: {
  vendor_id: string;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  owner?: string;
  assessment_id?: string | null;
}) {
  const title = data.title.trim();
  if (!data.vendor_id || !title) return fail("Vendor and title are required.");
  if (!REMEDIATION_PRIORITIES.includes(data.priority as RemediationPriority)) {
    return fail("Select a valid priority.");
  }
  if (data.due_date && !isValidDateString(data.due_date)) return fail("Due date is invalid.");

  const { error: vendorError } = await getActiveVendorOrError(data.vendor_id);
  if (vendorError) return fail(vendorError);

  if (data.assessment_id) {
    const { data: assessment, error } = await supabase
      .from("assessments")
      .select("vendor_id")
      .eq("id", data.assessment_id)
      .maybeSingle();
    if (error) return fail(error.message);
    if (!assessment || assessment.vendor_id !== data.vendor_id) {
      return fail("The selected assessment does not belong to this vendor.");
    }
  }

  const { error } = await supabase.from("remediations").insert({
    vendor_id: data.vendor_id,
    assessment_id: data.assessment_id || null,
    title,
    description: blankToNull(data.description),
    priority: data.priority,
    due_date: data.due_date || null,
    owner: blankToNull(data.owner),
    status: "Open",
    evidence: null,
  });
  if (error) return fail(error.message);

  revalidateApp();
  return { ok: true as const };
}

export async function updateRemediationStatus(id: string, status: RemediationStatus) {
  if (!REMEDIATION_STATUSES.includes(status)) return fail("Select a valid status.");

  if (status === "Closed") {
    const { data: current, error } = await supabase
      .from("remediations")
      .select("evidence")
      .eq("id", id)
      .maybeSingle();
    if (error) return fail(error.message);
    if (!current) return fail(NOT_SAVED);
    if (!hasDocumentedEvidence(current.evidence)) {
      return fail("Document fix evidence before closing this remediation.");
    }
  }

  const { data, error } = await supabase
    .from("remediations")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

export async function updateRemediationEvidence(id: string, evidence: string) {
  const { data: current, error: currentError } = await supabase
    .from("remediations")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (currentError) return fail(currentError.message);
  if (!current) return fail(NOT_SAVED);
  if (current.status === "Closed" && !hasDocumentedEvidence(evidence)) {
    return fail("Closed remediations must keep their evidence. Reopen it before clearing evidence.");
  }

  const { data, error } = await supabase
    .from("remediations")
    .update({ evidence: blankToNull(evidence) })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Policy
// ---------------------------------------------------------------------------

export async function saveTprmPolicy(id: string, input: TprmPolicyInput) {
  const invalid = validatePolicyInput(input);
  if (invalid) return fail(invalid);

  const payload = { ...input, updated_at: new Date().toISOString() };

  let savedPolicy;
  if (id && id !== "default") {
    const { data, error } = await supabase
      .from("tprm_policy")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail("Could not update policy settings.");
    savedPolicy = data;
  } else {
    const { data, error } = await supabase.from("tprm_policy").insert(payload).select("*").single();
    if (error) return fail(error.message);
    savedPolicy = data;
  }

  const syncError = await syncVendorNextReviewsFromPolicy(input);
  if (syncError) return fail(syncError);

  revalidateApp();
  return { ok: true as const, policy: savedPolicy };
}

async function syncVendorNextReviewsFromPolicy(policy: TprmPolicyInput): Promise<string | null> {
  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id, last_review_date, inherent_risk, status");

  if (error) return error.message;

  const updates = await Promise.all(
    (vendors ?? []).map((vendor) =>
      supabase
        .from("vendors")
        .update({
          next_review_date: computeNextReviewDate(
            vendor.last_review_date,
            vendor.inherent_risk,
            policy,
            vendor.status
          ),
        })
        .eq("id", vendor.id)
    )
  );

  const failed = updates.find((result) => result.error);
  return failed?.error?.message ?? null;
}

// ---------------------------------------------------------------------------
// Broadcasts
// ---------------------------------------------------------------------------

export async function createBroadcast(input: {
  title: string;
  message: string;
  broadcast_type: BroadcastType;
  audience: BroadcastAudience;
  audience_risk?: InherentRisk | null;
  vendor_ids?: string[];
  follow_up_due_date?: string | null;
}) {
  const title = input.title.trim();
  const message = input.message.trim();
  if (!title || !message) return fail("Title and message are required.");
  if (input.follow_up_due_date && !isValidDateString(input.follow_up_due_date)) {
    return fail("Follow-up due date is invalid.");
  }

  let query = supabase.from("vendors").select("id, contact_email").neq("status", "Offboarded");

  if (input.audience === "By inherent risk") {
    if (!input.audience_risk) return fail("Select an inherent risk level for the audience.");
    query = query.eq("inherent_risk", input.audience_risk);
  } else if (input.audience === "Selected vendors") {
    if (!input.vendor_ids?.length) return fail("Select at least one vendor.");
    query = query.in("id", input.vendor_ids);
  }

  const { data: vendors, error: vendorsError } = await query;
  if (vendorsError) return fail(vendorsError.message);
  if (!vendors?.length) return fail("No active vendors matched the selected audience.");

  const { data: broadcast, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      title,
      message,
      broadcast_type: input.broadcast_type,
      audience: input.audience,
      audience_risk: input.audience === "By inherent risk" ? input.audience_risk : null,
      status: "Sent",
      sent_at: new Date().toISOString(),
      follow_up_due_date: input.follow_up_due_date || null,
    })
    .select("*")
    .single();

  if (broadcastError) return fail(broadcastError.message);

  const { error: recipientsError } = await supabase.from("broadcast_recipients").insert(
    vendors.map((v) => ({ broadcast_id: broadcast.id, vendor_id: v.id, status: "Ongoing" }))
  );
  if (recipientsError) {
    await supabase.from("broadcasts").delete().eq("id", broadcast.id);
    return fail(recipientsError.message);
  }

  revalidateApp();
  return {
    ok: true as const,
    broadcastId: broadcast.id as string,
    recipientCount: vendors.length,
    recipientEmails: vendors.map((v) => v.contact_email as string).filter(Boolean),
  };
}

export async function updateBroadcastRecipientStatus(id: string, status: BroadcastRecipientStatus) {
  if (!BROADCAST_RECIPIENT_STATUSES.includes(status)) return fail("Select a valid status.");

  const { data: current, error: currentError } = await supabase
    .from("broadcast_recipients")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (currentError) return fail(currentError.message);
  if (!current) return fail(NOT_SAVED);
  if (current.status === status) return { ok: true as const };

  const now = new Date().toISOString();
  const payload =
    status === "Ongoing"
      ? { status, responded_at: null }
      : { status, responded_at: now, followed_up_at: now };

  const { data, error } = await supabase
    .from("broadcast_recipients")
    .update(payload)
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

export async function updateBroadcastRecipientNotes(id: string, notes: string) {
  const { data, error } = await supabase
    .from("broadcast_recipients")
    .update({ follow_up_notes: blankToNull(notes), followed_up_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

export async function deleteBroadcast(id: string) {
  const { data, error } = await supabase.from("broadcasts").delete().eq("id", id).select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail("Could not delete this outreach. It may already be gone.");

  revalidateApp();
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Experts
// ---------------------------------------------------------------------------

export async function saveExperts(updates: { id: string; name: string; email: string }[]) {
  for (const update of updates) {
    const name = update.name.trim();
    const email = update.email.trim();
    if (!name || !email) return fail("Name and email are required for every contact.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(`"${email}" is not a valid email.`);

    const { data, error } = await supabase
      .from("experts")
      .update({ name, email, updated_at: new Date().toISOString() })
      .eq("id", update.id)
      .select("id");

    if (error) return fail(error.message);
    if (!data?.length) return fail(NOT_SAVED);
  }

  revalidateApp();
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Security incidents
// ---------------------------------------------------------------------------

type IncidentInput = {
  title: string;
  description: string;
  severity: IncidentSeverity;
  detected_at: string;
  resolved_at: string | null;
  status: IncidentStatus;
};

function toIncidentRow(input: IncidentInput): { row?: Record<string, unknown>; error?: string } {
  const title = input.title.trim();
  if (!title) return { error: "Incident title is required." };
  if (!INCIDENT_SEVERITIES.includes(input.severity)) return { error: "Select a valid severity." };
  if (!INCIDENT_STATUSES.includes(input.status)) return { error: "Select a valid status." };
  if (!isValidDateString(input.detected_at)) return { error: "Detected date is required." };
  if (new Date(input.detected_at) > new Date()) {
    return { error: "Detected date cannot be in the future." };
  }

  let resolvedAt: string | null = null;
  if (input.status === "Resolved") {
    resolvedAt = input.resolved_at || new Date().toISOString();
    if (!isValidDateString(resolvedAt)) return { error: "Resolved date is invalid." };
    if (new Date(resolvedAt) < new Date(input.detected_at)) {
      return { error: "Resolved date must be after the detected date." };
    }
  }

  return {
    row: {
      title,
      description: blankToNull(input.description),
      severity: input.severity,
      detected_at: input.detected_at,
      resolved_at: resolvedAt,
      status: input.status,
    },
  };
}

export async function createIncident(input: IncidentInput & { vendor_id: string }) {
  if (!input.vendor_id) return fail("Select a vendor.");
  const { error: vendorError } = await getActiveVendorOrError(input.vendor_id);
  if (vendorError) return fail(vendorError);

  const { row, error: invalid } = toIncidentRow(input);
  if (invalid || !row) return fail(invalid ?? "Invalid incident.");

  const { error } = await supabase
    .from("security_incidents")
    .insert({ ...row, vendor_id: input.vendor_id });
  if (error) return fail(error.message);

  revalidateApp();
  return { ok: true as const };
}

export async function updateIncident(id: string, input: IncidentInput) {
  const { row, error: invalid } = toIncidentRow(input);
  if (invalid || !row) return fail(invalid ?? "Invalid incident.");

  const { data, error } = await supabase
    .from("security_incidents")
    .update(row)
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Interconnections
// ---------------------------------------------------------------------------

export async function updateInterconnection(
  id: string,
  input: { direction: ConnectionDirection; connection_type: ConnectionType; description: string }
) {
  if (!CONNECTION_DIRECTIONS.includes(input.direction)) return fail("Select a valid direction.");
  if (!CONNECTION_TYPES.includes(input.connection_type)) {
    return fail("Select a valid connection type.");
  }

  const { data, error } = await supabase
    .from("interconnections")
    .update({
      direction: input.direction,
      connection_type: input.connection_type,
      description: blankToNull(input.description),
    })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message);
  if (!data?.length) return fail(NOT_SAVED);

  revalidateApp();
  return { ok: true as const };
}
