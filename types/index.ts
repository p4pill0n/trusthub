export type VendorType =
  | "SaaS"
  | "On-Premise Software"
  | "Consulting"
  | "Payroll"
  | "Cloud Infrastructure"
  | "Market Data"
  | "Managed Services";

export type DataType = "PII" | "Financial" | "Legal";
export type DataClassification = "C0" | "C1" | "C2" | "C3";
export type InherentRisk = "Low" | "Medium" | "High" | "Very High";
export type ResidualRisk = "Low" | "Medium" | "High" | "Very High";
export type VendorStatus = "Active" | "Offboarded" | "Under Review";
export type StoredAssessmentStatus = "Pending" | "In Progress" | "Completed";
/** "Overdue" is derived: an open questionnaire past its response window. */
export type AssessmentStatus = StoredAssessmentStatus | "Overdue";
export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Open" | "Resolved";
export type BitSightRating = "Advanced" | "Intermediate" | "Basic" | "Beginners";
export type ConnectionDirection = "Inbound" | "Outbound" | "Bidirectional";
export type ConnectionType = "API" | "SFTP" | "VPN" | "Direct Link" | "Portal";
export type RemediationPriority = "Low" | "Medium" | "High" | "Critical";
export type RemediationStatus = "Open" | "In Progress" | "Closed";

export interface Vendor {
  id: string;
  name: string;
  entity_name: string;
  type: VendorType;
  datacontact_name: string;
  contact_email: string;
  os_manager_name?: string | null;
  data_type: DataType;
  data_classification: DataClassification;
  inherent_risk: InherentRisk;
  residual_risk: ResidualRisk;
  last_review_date: string | null;
  next_review_date: string | null;
  status: VendorStatus;
  created_at: string;
  user_id?: string | null;
}

export interface Assessment {
  id: string;
  vendor_id: string;
  launched_at: string | null;
  completed_at: string | null;
  status: StoredAssessmentStatus;
  risk_score: number | null;
  assessor_notes: string | null;
  questionnaire_token: string | null;
  responses: Record<string, string> | null;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email" | "status"> | null;
}

export interface SecurityIncident {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  detected_at: string;
  resolved_at: string | null;
  status: IncidentStatus;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email">;
}

export interface BitSightRatingRecord {
  id: string;
  vendor_id: string;
  score: number;
  rating: BitSightRating;
  fetched_at: string;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email">;
}

export interface Interconnection {
  id: string;
  vendor_id: string;
  direction: ConnectionDirection;
  connection_type: ConnectionType;
  description: string | null;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email" | "data_type">;
}

export interface Remediation {
  id: string;
  vendor_id: string;
  assessment_id: string | null;
  title: string;
  description: string | null;
  priority: RemediationPriority;
  status: RemediationStatus;
  due_date: string | null;
  owner: string | null;
  evidence: string | null;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email"> | null;
  assessments?: Pick<Assessment, "launched_at" | "completed_at"> | null;
}

export interface VendorActivity {
  assessments: Pick<
    Assessment,
    "id" | "status" | "launched_at" | "completed_at" | "risk_score"
  >[];
  remediations: Pick<Remediation, "id" | "title" | "status" | "priority" | "due_date">[];
  incidents: Pick<SecurityIncident, "id" | "title" | "severity" | "status" | "detected_at">[];
  bitsight: Pick<BitSightRatingRecord, "score" | "rating" | "fetched_at"> | null;
}

export interface FourthParty {
  id: string;
  parent_vendor_id: string;
  name: string;
  service_description: string | null;
  risk_level: ResidualRisk;
  country: string | null;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name">;
}

export interface RankedFourthParty {
  name: string;
  count: number;
  parentVendors: string[];
  serviceDescriptions: string[];
  countries: string[];
}

export interface DashboardStats {
  totalVendors: number;
  newVendorsLast90Days: number;
  veryHighResidualRisk: number;
  overdueReviews: number;
  dueIn90Days: number;
  openIncidents: number;
  criticalOpenIncidents: number;
  inherentRiskDistribution: { name: string; value: number; color: string }[];
  vendorTypes: { name: string; value: number }[];
  assessmentPipeline: { name: string; value: number; color: string }[];
  remediationsStatusDistribution: { name: string; value: number; color: string }[];
  totalRemediations: number;
}

export interface TprmPolicy {
  id: string;
  review_months_low: number;
  review_months_medium: number;
  review_months_high: number;
  review_months_very_high: number;
  updated_at: string | null;
  user_id?: string | null;
}

export type TprmPolicyInput = Omit<TprmPolicy, "id" | "updated_at" | "user_id">;

export type BroadcastType =
  | "General"
  | "Policy update"
  | "Major vulnerability"
  | "Incident notice";

export type BroadcastAudience = "All active vendors" | "By inherent risk" | "Selected vendors";

export type BroadcastStatus = "Draft" | "Sent";

export type BroadcastRecipientStatus = "Compliant" | "Not Compliant" | "Ongoing";

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  broadcast_type: BroadcastType;
  audience: BroadcastAudience;
  audience_risk: InherentRisk | null;
  status: BroadcastStatus;
  sent_at: string | null;
  follow_up_due_date: string | null;
  created_at: string;
  user_id?: string | null;
  recipient_count?: number;
}

export interface BroadcastRecipient {
  id: string;
  broadcast_id: string;
  vendor_id: string;
  status: BroadcastRecipientStatus;
  follow_up_notes: string | null;
  followed_up_at: string | null;
  responded_at: string | null;
  created_at: string;
  vendors?: Pick<Vendor, "name" | "contact_email" | "inherent_risk" | "entity_name"> | null;
  broadcasts?: Pick<Broadcast, "title" | "broadcast_type" | "sent_at" | "follow_up_due_date"> | null;
}

export type ExpertRegion = "France" | "UK" | "AMER" | "ASIA" | "India";

export type ExpertDomain =
  | "TPRM"
  | "Cyber"
  | "BCM"
  | "Operational Risk"
  | "Legal"
  | "Compliance";

export interface Expert {
  id: string;
  region: ExpertRegion;
  domain: ExpertDomain;
  name: string;
  email: string;
  title: string | null;
  created_at?: string;
  updated_at?: string | null;
  user_id?: string | null;
}

