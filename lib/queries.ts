import { supabase } from "./supabase";
import type {
  Assessment,
  BitSightRatingRecord,
  Vendor,
  DashboardStats,
  RankedFourthParty,
  TprmPolicy,
  Broadcast,
  BroadcastRecipient,
  Expert,
  Interconnection,
  Remediation,
  SecurityIncident,
  VendorActivity,
} from "@/types";
import { RISK_COLORS } from "./utils";
import { applyPolicyToVendor, applyPolicyToVendors, withPolicyDefaults } from "./policy";
import { differenceInDays, parseISO, startOfDay, subDays } from "date-fns";

export async function getTprmPolicy(): Promise<TprmPolicy> {
  const { data, error } = await supabase
    .from("tprm_policy")
    .select(
      "id, review_months_low, review_months_medium, review_months_high, review_months_very_high, updated_at, user_id"
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return withPolicyDefaults(data);
}

export async function getVendors(): Promise<Vendor[]> {
  const [{ data, error }, policy] = await Promise.all([
    supabase.from("vendors").select("*").order("name"),
    getTprmPolicy(),
  ]);
  if (error) throw error;
  return applyPolicyToVendors((data ?? []) as Vendor[], policy);
}

/** Vendors that can receive new assessments, remediations, incidents and broadcasts. */
export async function getActiveVendors(): Promise<Vendor[]> {
  const vendors = await getVendors();
  return vendors.filter((v) => v.status !== "Offboarded");
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const [{ data, error }, policy] = await Promise.all([
    supabase.from("vendors").select("*").eq("id", id).maybeSingle(),
    getTprmPolicy(),
  ]);
  if (error) throw error;
  return data ? applyPolicyToVendor(data as Vendor, policy) : null;
}

function isOverdue(nextReviewDate: string | null, today: Date) {
  if (!nextReviewDate) return false;
  return startOfDay(parseISO(nextReviewDate.slice(0, 10))) < today;
}

export async function getTopOverdueVendors(limit = 8): Promise<Vendor[]> {
  const today = startOfDay(new Date());
  const vendors = await getActiveVendors();
  return vendors
    .filter((v) => isOverdue(v.next_review_date, today))
    .sort((a, b) => (a.next_review_date ?? "").localeCompare(b.next_review_date ?? ""))
    .slice(0, limit);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [allVendors, remediationsResult, incidentsResult] = await Promise.all([
    getActiveVendors(),
    supabase
      .from("remediations")
      .select("status, vendors!inner(status)")
      .neq("vendors.status", "Offboarded"),
    supabase
      .from("security_incidents")
      .select("severity, vendors!inner(status)")
      .eq("status", "Open")
      .neq("vendors.status", "Offboarded"),
  ]);

  const { data: remediationsItems, error: remediationsError } = remediationsResult;
  const { data: openIncidents, error: incidentsError } = incidentsResult;
  if (remediationsError) throw remediationsError;
  if (incidentsError) throw incidentsError;

  const today = startOfDay(new Date());
  const ninetyDaysAgo = subDays(today, 90);

  const totalVendors = allVendors.length;
  const newVendorsLast90Days = allVendors.filter(
    (v) => v.created_at && parseISO(v.created_at) >= ninetyDaysAgo
  ).length;
  const veryHighResidualRisk = allVendors.filter(
    (v) => v.residual_risk === "Very High" || (v.residual_risk as string) === "Critical"
  ).length;

  const overdueReviews = allVendors.filter((v) => isOverdue(v.next_review_date, today)).length;

  const dueIn90Days = allVendors.filter((v) => {
    if (!v.next_review_date) return false;
    const days = differenceInDays(startOfDay(parseISO(v.next_review_date.slice(0, 10))), today);
    return days >= 0 && days <= 90;
  }).length;

  const riskLevels = ["Low", "Medium", "High", "Very High"] as const;
  const inherentRiskDistribution = riskLevels.map((level) => ({
    name: level,
    value: allVendors.filter(
      (v) =>
        v.inherent_risk === level ||
        (level === "Very High" && (v.inherent_risk as string) === "Critical")
    ).length,
    color: RISK_COLORS[level],
  }));

  const typeMap = new Map<string, number>();
  allVendors.forEach((v) => {
    typeMap.set(v.type, (typeMap.get(v.type) ?? 0) + 1);
  });
  const vendorTypes = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));

  const pipelineBuckets = [
    { name: "Not reviewed", color: "#71717a" },
    { name: "Overdue", color: "#ef4444" },
    { name: "< 30d", color: "#f97316" },
    { name: "30–90d", color: "#eab308" },
    { name: "> 90d", color: "#a1a1aa" },
  ];
  const pipelineCounts = new Map(pipelineBuckets.map((b) => [b.name, 0]));
  allVendors.forEach((v) => {
    let bucket: string;
    if (!v.last_review_date || !v.next_review_date) {
      bucket = "Not reviewed";
    } else {
      const days = differenceInDays(
        startOfDay(parseISO(v.next_review_date.slice(0, 10))),
        today
      );
      bucket = days < 0 ? "Overdue" : days < 30 ? "< 30d" : days <= 90 ? "30–90d" : "> 90d";
    }
    pipelineCounts.set(bucket, (pipelineCounts.get(bucket) ?? 0) + 1);
  });
  const assessmentPipeline = pipelineBuckets.map(({ name, color }) => ({
    name,
    value: pipelineCounts.get(name) ?? 0,
    color,
  }));

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

  const incidents = openIncidents ?? [];

  return {
    totalVendors,
    newVendorsLast90Days,
    veryHighResidualRisk,
    overdueReviews,
    dueIn90Days,
    openIncidents: incidents.length,
    criticalOpenIncidents: incidents.filter(
      (i) => i.severity === "Critical" || i.severity === "High"
    ).length,
    inherentRiskDistribution,
    vendorTypes,
    assessmentPipeline,
    remediationsStatusDistribution,
    totalRemediations: allRemediations.length,
  };
}

export async function getAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*, vendors(name, contact_email, status)")
    .order("launched_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as Assessment[];
}

export async function getAssessmentByToken(token: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*, vendors(name, contact_email, status)")
    .eq("questionnaire_token", token)
    .maybeSingle();

  if (error) throw error;
  return data as Assessment | null;
}

export async function getIncidents(): Promise<SecurityIncident[]> {
  const { data, error } = await supabase
    .from("security_incidents")
    .select("*, vendors(name, contact_email)")
    .order("detected_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SecurityIncident[];
}

/** Latest rating per active vendor. */
export async function getBitSightRatings(): Promise<BitSightRatingRecord[]> {
  const { data, error } = await supabase
    .from("bitsight_ratings")
    .select("*, vendors!inner(name, contact_email, status)")
    .neq("vendors.status", "Offboarded")
    .order("fetched_at", { ascending: false });

  if (error) throw error;

  const latest = new Map<string, BitSightRatingRecord>();
  for (const row of (data ?? []) as BitSightRatingRecord[]) {
    if (!latest.has(row.vendor_id)) latest.set(row.vendor_id, row);
  }
  return Array.from(latest.values()).sort((a, b) => a.score - b.score);
}

export async function getInterconnections(): Promise<Interconnection[]> {
  const { data, error } = await supabase
    .from("interconnections")
    .select("*, vendors!inner(name, contact_email, data_type, status)")
    .neq("vendors.status", "Offboarded");

  if (error) throw error;
  return ((data ?? []) as Interconnection[]).sort((a, b) =>
    (a.vendors?.name ?? "").localeCompare(b.vendors?.name ?? "")
  );
}

export async function getRemediations(): Promise<Remediation[]> {
  const { data, error } = await supabase
    .from("remediations")
    .select("*, vendors(name, contact_email), assessments(launched_at, completed_at)")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as Remediation[];
}

async function getFourthParties() {
  const { data, error } = await supabase
    .from("fourth_parties")
    .select("*, vendors!inner(name, status)")
    .neq("vendors.status", "Offboarded");

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

export async function getVendorActivity(vendorId: string): Promise<VendorActivity> {
  const [assessments, remediations, incidents, bitsight, fourthParties, interconnections] =
    await Promise.all([
      supabase
        .from("assessments")
        .select("id, status, launched_at, completed_at, risk_score")
        .eq("vendor_id", vendorId)
        .order("launched_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("remediations")
        .select("id, title, status, priority, due_date")
        .eq("vendor_id", vendorId)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("security_incidents")
        .select("id, title, severity, status, detected_at")
        .eq("vendor_id", vendorId)
        .order("detected_at", { ascending: false }),
      supabase
        .from("bitsight_ratings")
        .select("score, rating, fetched_at")
        .eq("vendor_id", vendorId)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("fourth_parties")
        .select("id, name, service_description, risk_level, country")
        .eq("parent_vendor_id", vendorId)
        .order("name", { ascending: true }),
      supabase
        .from("interconnections")
        .select("id, direction, connection_type, description")
        .eq("vendor_id", vendorId)
        .order("connection_type", { ascending: true }),
    ]);

  for (const result of [
    assessments,
    remediations,
    incidents,
    bitsight,
    fourthParties,
    interconnections,
  ]) {
    if (result.error) throw result.error;
  }

  return {
    assessments: (assessments.data ?? []) as VendorActivity["assessments"],
    remediations: (remediations.data ?? []) as VendorActivity["remediations"],
    incidents: (incidents.data ?? []) as VendorActivity["incidents"],
    bitsight: (bitsight.data ?? null) as VendorActivity["bitsight"],
    fourthParties: (fourthParties.data ?? []) as VendorActivity["fourthParties"],
    interconnections: (interconnections.data ?? []) as VendorActivity["interconnections"],
  };
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  const { data, error } = await supabase
    .from("broadcasts")
    .select("*, broadcast_recipients(count)")
    .order("sent_at", { ascending: false, nullsFirst: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const countRelation = row.broadcast_recipients as { count: number }[] | null;
    const { broadcast_recipients: _ignored, ...broadcast } = row;
    return {
      ...(broadcast as Broadcast),
      recipient_count: countRelation?.[0]?.count ?? 0,
    };
  });
}

export async function getBroadcastRecipients(): Promise<BroadcastRecipient[]> {
  const { data, error } = await supabase
    .from("broadcast_recipients")
    .select(
      "*, vendors(name, contact_email, inherent_risk, entity_name), broadcasts(title, broadcast_type, sent_at, follow_up_due_date)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as BroadcastRecipient[]) ?? [];
}

export async function getExperts(): Promise<Expert[]> {
  const { data, error } = await supabase
    .from("experts")
    .select("*")
    .order("region", { ascending: true })
    .order("domain", { ascending: true });

  if (error) throw error;
  return (data as Expert[]) ?? [];
}
