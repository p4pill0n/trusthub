"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import {
  calculateRiskScore,
  getQuestionnaireUrl,
  type QuestionnaireAnswer,
} from "@/lib/questionnaire";
import { computeNextReviewDate } from "@/lib/policy";
import { getExpertsByRegion } from "@/lib/queries";
import type {
  RemediationStatus,
  VendorStatus,
  TprmPolicyInput,
  BroadcastType,
  BroadcastAudience,
  InherentRisk,
  BroadcastRecipientStatus,
  Expert,
  IncidentSeverity,
  IncidentStatus,
  ConnectionDirection,
  ConnectionType,
} from "@/types";

export async function updateRemediationStatus(id: string, status: RemediationStatus) {
  const { error } = await supabase.from("remediations").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/remediations");
  revalidatePath("/");
}

export async function createRemediation(data: {
  vendor_id: string;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  owner?: string;
}) {
  const { error } = await supabase.from("remediations").insert({
    ...data,
    status: "Open",
    evidence: "Remediation not yet started. No fix actions documented.",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/remediations");
  revalidatePath("/");
}

export async function createVendor(data: {
  name: string;
  entity_name: string;
  type: string;
  datacontact_name: string;
  contact_email: string;
  os_manager_name?: string;
  data_type: string;
  data_classification: string;
  inherent_risk: string;
  residual_risk: string;
  status?: VendorStatus;
}) {
  const { status = "Under Review", ...vendorData } = data;
  const { error } = await supabase.from("vendors").insert({
    ...vendorData,
    status,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
  revalidatePath("/risk-assessment");
  revalidatePath("/");
}

export async function updateVendorStatus(id: string, status: VendorStatus) {
  const { error } = await supabase.from("vendors").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
  revalidatePath("/");
}

export async function updateVendor(
  id: string,
  data: {
    name: string;
    entity_name: string;
    type: string;
    datacontact_name: string;
    contact_email: string;
    os_manager_name?: string | null;
    data_type: string;
    data_classification: string;
    inherent_risk: InherentRisk;
    residual_risk: string;
    status: VendorStatus;
    last_review_date?: string | null;
    next_review_date?: string | null;
  }
) {
  const name = data.name.trim();
  const datacontact_name = data.datacontact_name.trim();
  const contact_email = data.contact_email.trim();

  if (!name || !datacontact_name || !contact_email) {
    return { ok: false as const, error: "Name, contact, and email are required." };
  }

  const { error } = await supabase
    .from("vendors")
    .update({
      name,
      entity_name: data.entity_name,
      type: data.type,
      datacontact_name,
      contact_email,
      os_manager_name: data.os_manager_name?.trim() || null,
      data_type: data.data_type,
      data_classification: data.data_classification,
      inherent_risk: data.inherent_risk,
      residual_risk: data.residual_risk,
      status: data.status,
      last_review_date: data.last_review_date || null,
      next_review_date: data.next_review_date || null,
    })
    .eq("id", id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/vendors");
  revalidatePath("/risk-assessment");
  revalidatePath("/");
  return { ok: true as const };
}

export async function launchAssessment(vendorId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("assessments")
    .select("id, questionnaire_token")
    .eq("vendor_id", vendorId)
    .in("status", ["Pending", "In Progress"])
    .limit(1);

  if (existingError) {
    return {
      ok: false as const,
      error: existingError.message,
      existingToken: null,
      existingUrl: null,
    };
  }

  if (existing && existing.length > 0) {
    const token = (existing[0].questionnaire_token as string | null) ?? null;
    return {
      ok: false as const,
      error: "This vendor already has an open assessment. You can copy the existing questionnaire link below.",
      existingToken: token,
      existingUrl: token ? getQuestionnaireUrl(token) : null,
    };
  }

  const token = randomUUID();
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      vendor_id: vendorId,
      launched_at: new Date().toISOString(),
      status: "Pending",
      questionnaire_token: token,
      assessor_notes: "Third-party security risk questionnaire sent to vendor.",
    })
    .select("id, questionnaire_token")
    .single();

  if (error) {
    return {
      ok: false as const,
      error: error.message,
      existingToken: null,
      existingUrl: null,
    };
  }

  revalidatePath("/vendors");
  revalidatePath("/risk-assessment");
  revalidatePath("/");

  return {
    ok: true as const,
    id: data.id,
    token: data.questionnaire_token as string,
    url: getQuestionnaireUrl(data.questionnaire_token as string),
  };
}

export async function startQuestionnaire(token: string) {
  const { error } = await supabase
    .from("assessments")
    .update({ status: "In Progress" })
    .eq("questionnaire_token", token)
    .eq("status", "Pending");

  if (error) throw new Error(error.message);
  revalidatePath("/risk-assessment");
}

export async function submitQuestionnaire(
  token: string,
  responses: Record<string, QuestionnaireAnswer>
) {
  const riskScore = calculateRiskScore(responses);

  const { error } = await supabase
    .from("assessments")
    .update({
      responses,
      risk_score: riskScore,
      status: "Completed",
      completed_at: new Date().toISOString(),
    })
    .eq("questionnaire_token", token)
    .neq("status", "Completed");

  if (error) throw new Error(error.message);

  revalidatePath("/risk-assessment");
  revalidatePath("/");
}

export async function deleteAssessment(id: string) {
  const { data, error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false as const, error: error.message };
  }
  if (!data?.length) {
    return {
      ok: false as const,
      error: "Could not delete this assessment. It may already be gone, or delete permission is missing.",
    };
  }

  revalidatePath("/risk-assessment");
  revalidatePath("/vendors");
  revalidatePath("/");
  return { ok: true as const };
}

export async function saveTprmPolicy(id: string, input: TprmPolicyInput) {
  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  let savedPolicy;

  if (id && id !== "default") {
    const { data, error } = await supabase
      .from("tprm_policy")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return { ok: false as const, error: error.message };
    }
    if (!data) {
      return { ok: false as const, error: "Could not update policy settings." };
    }
    savedPolicy = data;
  } else {
    const { data, error } = await supabase
      .from("tprm_policy")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return { ok: false as const, error: error.message };
    }
    savedPolicy = data;
  }

  const syncError = await syncVendorNextReviewsFromPolicy(input);
  if (syncError) {
    return { ok: false as const, error: syncError };
  }

  revalidatePath("/policy");
  revalidatePath("/vendors");
  revalidatePath("/");
  revalidatePath("/risk-assessment");
  return { ok: true as const, policy: savedPolicy };
}

async function syncVendorNextReviewsFromPolicy(policy: TprmPolicyInput): Promise<string | null> {
  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id, last_review_date, inherent_risk");

  if (error) return error.message;

  const updates = await Promise.all(
    (vendors ?? []).map((vendor) =>
      supabase
        .from("vendors")
        .update({
          next_review_date: computeNextReviewDate(
            vendor.last_review_date,
            vendor.inherent_risk,
            policy
          ),
        })
        .eq("id", vendor.id)
    )
  );

  const failed = updates.find((result) => result.error);
  return failed?.error?.message ?? null;
}

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
  if (!title || !message) {
    return { ok: false as const, error: "Title and message are required." };
  }

  let vendorIds = input.vendor_ids ?? [];

  if (input.audience === "All active vendors") {
    const { data, error } = await supabase
      .from("vendors")
      .select("id")
      .neq("status", "Offboarded");
    if (error) return { ok: false as const, error: error.message };
    vendorIds = (data ?? []).map((v) => v.id);
  } else if (input.audience === "By inherent risk") {
    if (!input.audience_risk) {
      return { ok: false as const, error: "Select an inherent risk level for the audience." };
    }
    const { data, error } = await supabase
      .from("vendors")
      .select("id")
      .eq("inherent_risk", input.audience_risk)
      .neq("status", "Offboarded");
    if (error) return { ok: false as const, error: error.message };
    vendorIds = (data ?? []).map((v) => v.id);
  } else if (vendorIds.length === 0) {
    return { ok: false as const, error: "Select at least one vendor." };
  }

  if (vendorIds.length === 0) {
    return { ok: false as const, error: "No vendors matched the selected audience." };
  }

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

  if (broadcastError) {
    return { ok: false as const, error: broadcastError.message };
  }

  const recipients = vendorIds.map((vendor_id) => ({
    broadcast_id: broadcast.id,
    vendor_id,
    status: "Ongoing" as const,
  }));

  const { error: recipientsError } = await supabase.from("broadcast_recipients").insert(recipients);
  if (recipientsError) {
    return { ok: false as const, error: recipientsError.message };
  }

  revalidatePath("/broadcast/create");
  revalidatePath("/broadcast/follow-up");
  return {
    ok: true as const,
    broadcast,
    recipientCount: vendorIds.length,
  };
}

export async function updateBroadcastRecipientStatus(
  id: string,
  status: BroadcastRecipientStatus,
  followUpNotes?: string
) {
  const payload: Record<string, string | null> = { status };

  if (status === "Compliant" || status === "Not Compliant") {
    payload.responded_at = new Date().toISOString();
    payload.followed_up_at = new Date().toISOString();
  }
  if (followUpNotes !== undefined) {
    payload.follow_up_notes = followUpNotes.trim() || null;
  }

  const { error } = await supabase.from("broadcast_recipients").update(payload).eq("id", id);
  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/broadcast/follow-up");
  return { ok: true as const };
}

export async function deleteBroadcast(id: string) {
  const { error } = await supabase.from("broadcasts").delete().eq("id", id);
  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/broadcast/follow-up");
  revalidatePath("/broadcast/create");
  return { ok: true as const };
}

export async function saveExperts(
  updates: { id: string; name: string; email: string }[]
) {
  if (updates.length === 0) {
    return { ok: true as const };
  }

  for (const update of updates) {
    const name = update.name.trim();
    const email = update.email.trim();
    if (!name || !email) {
      return { ok: false as const, error: "Name and email are required for every contact." };
    }

    const { error } = await supabase
      .from("experts")
      .update({
        name,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", update.id);

    if (error) {
      return { ok: false as const, error: error.message };
    }
  }

  revalidatePath("/experts");
  revalidatePath("/vendors");
  revalidatePath("/");
  return { ok: true as const };
}

export async function fetchExpertsForRegion(region: string) {
  try {
    const experts = await getExpertsByRegion(region);
    return { ok: true as const, experts };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to load experts.",
      experts: [] as Expert[],
    };
  }
}

export async function saveIncidents(
  updates: {
    id: string;
    title: string;
    description: string;
    severity: IncidentSeverity;
    detected_at: string;
    resolved_at: string | null;
    status: IncidentStatus;
  }[]
) {
  if (updates.length === 0) {
    return { ok: true as const };
  }

  for (const update of updates) {
    const title = update.title.trim();
    if (!title) {
      return { ok: false as const, error: "Incident title is required." };
    }
    if (!update.detected_at) {
      return { ok: false as const, error: "Detected date is required." };
    }

    const resolvedAt =
      update.status === "Resolved"
        ? update.resolved_at || new Date().toISOString()
        : update.resolved_at;

    const { error } = await supabase
      .from("security_incidents")
      .update({
        title,
        description: update.description.trim() || null,
        severity: update.severity,
        detected_at: update.detected_at,
        resolved_at: resolvedAt,
        status: update.status,
      })
      .eq("id", update.id);

    if (error) {
      return { ok: false as const, error: error.message };
    }
  }

  revalidatePath("/incidents");
  revalidatePath("/");
  return { ok: true as const };
}

export async function saveInterconnections(
  updates: {
    id: string;
    direction: ConnectionDirection;
    connection_type: ConnectionType;
    description: string;
  }[]
) {
  if (updates.length === 0) {
    return { ok: true as const };
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("interconnections")
      .update({
        direction: update.direction,
        connection_type: update.connection_type,
        description: update.description.trim() || null,
      })
      .eq("id", update.id);

    if (error) {
      return { ok: false as const, error: error.message };
    }
  }

  revalidatePath("/interconnections");
  return { ok: true as const };
}

