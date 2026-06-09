const VENDOR_DOMAIN_OVERRIDES: Record<string, string> = {
  "Microsoft Azure": "microsoft.com",
  AWS: "aws.amazon.com",
  "Moody's Analytics": "moodys.com",
  Bloomberg: "bloomberg.com",
};

export function getVendorDomain(name: string, contactEmail?: string | null): string | null {
  if (VENDOR_DOMAIN_OVERRIDES[name]) {
    return VENDOR_DOMAIN_OVERRIDES[name];
  }

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
