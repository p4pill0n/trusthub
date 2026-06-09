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
export type AssessmentStatus = "Pending" | "In Progress" | "Completed" | "Overdue";
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
  status: AssessmentStatus;
  risk_score: number | null;
  assessor_notes: string | null;
  questionnaire_token: string | null;
  responses: Record<string, string> | null;
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email"> | null;
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
  user_id?: string | null;
  vendors?: Pick<Vendor, "name" | "contact_email">;
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
  criticalResidualRisk: number;
  overdueAssessments: number;
  dueIn90Days: number;
  inherentRiskDistribution: { name: string; value: number; color: string }[];
  vendorTypes: { name: string; value: number }[];
  assessmentPipeline: { name: string; value: number; color: string }[];
  remediationsStatusDistribution: { name: string; value: number; color: string }[];
  totalRemediations: number;
}
