const VENDOR_DOMAIN_OVERRIDES: Record<string, string> = {
  "Microsoft Azure": "microsoft.com",
  Azure: "microsoft.com",
  AWS: "aws.amazon.com",
  "Moody's Analytics": "moodys.com",
  Bloomberg: "bloomberg.com",
  Heroku: "heroku.com",
  MuleSoft: "mulesoft.com",
  Akamai: "akamai.com",
  Cloudflare: "cloudflare.com",
  Datadog: "datadoghq.com",
  PagerDuty: "pagerduty.com",
  Concur: "concur.com",
  Qualtrics: "qualtrics.com",
  Intel: "intel.com",
  "Visa Network": "visa.com",
  Visa: "visa.com",
  "Mastercard Network": "mastercard.com",
  Mastercard: "mastercard.com",
  Refinitiv: "refinitiv.com",
  "Red Hat": "redhat.com",
  HashiCorp: "hashicorp.com",
  Cognizant: "cognizant.com",
  Salesforce: "salesforce.com",
  Stripe: "stripe.com",
  Splunk: "splunk.com",
  Snowflake: "snowflake.com",
  ServiceNow: "servicenow.com",
  ADP: "adp.com",
  IBM: "ibm.com",
  SAP: "sap.com",
  "BCD Travel": "bcdtravel.com",
  Cisco: "cisco.com",
  COLT: "colt.net",
  EquiLend: "equilend.com",
  Fidessa: "fidessa.com",
  FIS: "fisglobal.com",
  "ION Group": "iongroup.com",
  Microsoft: "microsoft.com",
  Murex: "murex.com",
  TOPdesk: "topdesk.com",
  WPA: "wpa.org.uk",
  Zellis: "zellis.com",
};

function lookupDomainOverride(name: string): string | null {
  if (VENDOR_DOMAIN_OVERRIDES[name]) return VENDOR_DOMAIN_OVERRIDES[name];

  const normalized = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (VENDOR_DOMAIN_OVERRIDES[normalized]) return VENDOR_DOMAIN_OVERRIDES[normalized];

  const lower = normalized.toLowerCase();
  for (const [key, domain] of Object.entries(VENDOR_DOMAIN_OVERRIDES)) {
    if (key.toLowerCase() === lower) return domain;
  }

  return null;
}

export function getVendorDomain(name: string, contactEmail?: string | null): string | null {
  const override = lookupDomainOverride(name);
  if (override) return override;

  if (!contactEmail?.includes("@")) return null;

  const domain = contactEmail.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;

  return domain;
}

export function getVendorIconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export function getVendorFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export function getVendorInitials(name: string): string {
  const words = name
    .replace(/['']/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}
