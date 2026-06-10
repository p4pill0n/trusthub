import { supabase } from "./supabase";
import type { Assessment, Vendor, DashboardStats, RankedFourthParty } from "@/types";
import { RISK_COLORS } from "./utils";
import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

export async function getVendors(filters?: {
  status?: string;
  type?: string;
  inherentRisk?: string;
  residualRisk?: string;
  search?: string;
}): Promise<Vendor[]> {
  let query = supabase.from("vendors").select("*").order("name");

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.inherentRisk) query = query.eq("inherent_risk", filters.inherentRisk);
  if (filters?.residualRisk) query = query.eq("residual_risk", filters.residualRisk);
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,entity_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTopOverdueVendors(limit = 8): Promise<Vendor[]> {
  const today = format(startOfDay(new Date()), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .neq("status", "Offboarded")
    .not("next_review_date", "is", null)
    .lt("next_review_date", today)
    .order("next_review_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [vendorsResult, remediationsResult] = await Promise.all([
    supabase.from("vendors").select("*").neq("status", "Offboarded"),
    supabase.from("remediations").select("status"),
  ]);

  const { data: vendors, error } = vendorsResult;
  const { data: remediationsItems, error: remediationsError } = remediationsResult;
  if (error) throw error;
  if (remediationsError) throw remediationsError;

  const allVendors = vendors ?? [];
  const today = startOfDay(new Date());
  const in90Days = new Date(today);
  in90Days.setDate(in90Days.getDate() + 90);

  const totalVendors = allVendors.length;
  const veryHighResidualRisk = allVendors.filter(
    (v) => v.residual_risk === "Very High" || (v.residual_risk as string) === "Critical"
  ).length;

  const overdueAssessments = allVendors.filter((v) => {
    if (!v.next_review_date) return false;
    return startOfDay(parseISO(v.next_review_date.slice(0, 10))) < today;
  }).length;

  const dueIn90Days = allVendors.filter((v) => {
    if (!v.next_review_date) return false;
    const d = startOfDay(parseISO(v.next_review_date.slice(0, 10)));
    return d >= today && d <= in90Days;
  }).length;

  const riskLevels = ["Low", "Medium", "High", "Very High"] as const;
  const inherentRiskDistribution = riskLevels.map((level) => ({
    name: level,
    value: allVendors.filter(
      (v) => v.inherent_risk === level || (level === "Very High" && (v.inherent_risk as string) === "Critical")
    ).length,
    color: RISK_COLORS[level],
  }));

  const typeMap = new Map<string, number>();
  allVendors.forEach((v) => {
    typeMap.set(v.type, (typeMap.get(v.type) ?? 0) + 1);
  });
  const vendorTypes = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));

  const pipeline = [
    { name: "Overdue", color: "#ef4444" },
    { name: "< 30d", color: "#f97316" },
    { name: "30–90d", color: "#eab308" },
    { name: "> 90d", color: "#a1a1aa" },
  ];

  const assessmentPipeline = pipeline.map(({ name, color }) => {
    let count = 0;
    allVendors.forEach((v) => {
      if (!v.next_review_date) return;
      const days = differenceInDays(startOfDay(parseISO(v.next_review_date.slice(0, 10))), today);
      if (name === "Overdue" && days < 0) count++;
      else if (name === "< 30d" && days >= 0 && days < 30) count++;
      else if (name === "30–90d" && days >= 30 && days <= 90) count++;
      else if (name === "> 90d" && days > 90) count++;
    });
    return { name, value: count, color };
  });

  const remediationsStatuses = [
    { name: "Not started", status: "Open", color: "#ef4444" },
    { name: "In Progress", status: "In Progress", color: "#d97706" },
    { name: "Closed", status: "Closed", color: "#22c55e" },
  ] as const;

  const allRemediations = remediationsItems ?? [];
  const remediationsStatusDistribution = remediationsStatuses.map(({ name, status, color }) => ({
    name,
    value: allRemediations.filter((r) => r.status === status).length,
    color,
  }));

  return {
    totalVendors,
    criticalResidualRisk: veryHighResidualRisk,
    overdueAssessments,
    dueIn90Days,
    inherentRiskDistribution,
    vendorTypes,
    assessmentPipeline,
    remediationsStatusDistribution,
    totalRemediations: allRemediations.length,
  };
}

export async function getAssessments(filters?: { status?: string }): Promise<Assessment[]> {
  let query = supabase
    .from("assessments")
    .select("*, vendors(name, contact_email)")
    .order("launched_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAssessmentByToken(token: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*, vendors(name, contact_email)")
    .eq("questionnaire_token", token)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getIncidents(filters?: { severity?: string; status?: string }) {
  let query = supabase
    .from("security_incidents")
    .select("*, vendors(name, contact_email)")
    .order("detected_at", { ascending: false });

  if (filters?.severity) query = query.eq("severity", filters.severity);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBitSightRatings() {
  const { data, error } = await supabase
    .from("bitsight_ratings")
    .select("*, vendors(name, contact_email)")
    .order("score", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getInterconnections() {
  const { data, error } = await supabase
    .from("interconnections")
    .select("*, vendors(name, contact_email, data_type)")
    .order("vendor_id");

  if (error) throw error;
  return data ?? [];
}

export async function getRemediations(filters?: { status?: string; priority?: string }) {
  let query = supabase
    .from("remediations")
    .select("*, vendors(name, contact_email)")
    .order("due_date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.priority) query = query.eq("priority", filters.priority);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function getFourthParties() {
  const { data, error } = await supabase
    .from("fourth_parties")
    .select("*, vendors(name)")
    .order("parent_vendor_id");

  if (error) throw error;
  return data ?? [];
}

function normalizeFourthPartyName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim() || name;
}

export async function getRankedFourthParties(): Promise<RankedFourthParty[]> {
  const fourthParties = await getFourthParties();
  const map = new Map<string, RankedFourthParty>();

  for (const fp of fourthParties) {
    const key = normalizeFourthPartyName(fp.name);
    const parent = fp.vendors?.name ?? "Unknown";
    const existing = map.get(key);

    if (existing) {
      existing.count += 1;
      if (!existing.parentVendors.includes(parent)) existing.parentVendors.push(parent);
      if (fp.service_description && !existing.serviceDescriptions.includes(fp.service_description)) {
        existing.serviceDescriptions.push(fp.service_description);
      }
      if (fp.country && !existing.countries.includes(fp.country)) {
        existing.countries.push(fp.country);
      }
    } else {
      map.set(key, {
        name: key,
        count: 1,
        parentVendors: [parent],
        serviceDescriptions: fp.service_description ? [fp.service_description] : [],
        countries: fp.country ? [fp.country] : [],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

