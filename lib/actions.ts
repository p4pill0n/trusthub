"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import {
  calculateRiskScore,
  getQuestionnaireUrl,
  type QuestionnaireAnswer,
} from "@/lib/questionnaire";
import type { RemediationStatus, VendorStatus } from "@/types";

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

export async function launchAssessment(vendorId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("assessments")
    .select("id")
    .eq("vendor_id", vendorId)
    .in("status", ["Pending", "In Progress"])
    .limit(1);

  if (existingError) throw new Error(existingError.message);
  if (existing && existing.length > 0) {
    throw new Error("This vendor already has an open assessment.");
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

  if (error) throw new Error(error.message);

  revalidatePath("/vendors");
  revalidatePath("/risk-assessment");
  revalidatePath("/");

  return {
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
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/risk-assessment");
  revalidatePath("/vendors");
  revalidatePath("/");
}
