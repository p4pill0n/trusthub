import type {
  DataClassification,
  DataType,
  ExpertRegion,
  InherentRisk,
  VendorStatus,
  VendorType,
} from "@/types";

export const ENTITY_OPTIONS: ExpertRegion[] = ["France", "UK", "AMER", "ASIA", "India"];

export const VENDOR_TYPES: VendorType[] = [
  "SaaS",
  "On-Premise Software",
  "Consulting",
  "Payroll",
  "Cloud Infrastructure",
  "Market Data",
  "Managed Services",
];

export const DATA_TYPES: DataType[] = ["PII", "Financial", "Legal"];
export const DATA_CLASSIFICATIONS: DataClassification[] = ["C0", "C1", "C2", "C3"];
export const RISK_LEVELS: InherentRisk[] = ["Low", "Medium", "High", "Very High"];
export const VENDOR_STATUSES: VendorStatus[] = ["Active", "Under Review", "Offboarded"];
