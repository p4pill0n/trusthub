"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveExperts } from "@/lib/actions";
import type { Expert, ExpertDomain, ExpertRegion } from "@/types";
import { Check, Pencil, X } from "lucide-react";

interface ExpertsClientProps {
  experts: Expert[];
}

type ExpertDraft = {
  name: string;
  email: string;
};

const REGIONS: ExpertRegion[] = ["France", "UK", "AMER", "ASIA", "India"];
const DOMAINS: ExpertDomain[] = [
  "TPRM",
  "Cyber",
  "BCM",
  "Operational Risk",
  "Legal",
  "Compliance",
];

/** ISO country codes for flagcdn.com (Windows does not render emoji flags). */
const REGION_FLAG_CODES: Record<ExpertRegion, string> = {
  France: "fr",
  UK: "gb",
  AMER: "us",
  ASIA: "sg",
  India: "in",
};

const DOMAIN_ORDER = new Map(DOMAINS.map((domain, index) => [domain, index]));
const REGION_ORDER = new Map(REGIONS.map((region, index) => [region, index]));

function RegionFlag({ region, className }: { region: ExpertRegion; className?: string }) {
  const code = REGION_FLAG_CODES[region];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={20}
      height={15}
      alt=""
      className={
        className ??
        "inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
      }
      loading="lazy"
    />
  );
}

function RegionBadge({ region }: { region: ExpertRegion }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-medium">
      <RegionFlag region={region} />
      <span>{region}</span>
    </span>
  );
}

function toDrafts(experts: Expert[]): Record<string, ExpertDraft> {
  return Object.fromEntries(
    experts.map((expert) => [expert.id, { name: expert.name, email: expert.email }])
  );
}

export function ExpertsClient({ experts }: ExpertsClientProps) {
  const [regionFilter, setRegionFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, ExpertDraft>>(() => toDrafts(experts));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDrafts(toDrafts(experts));
    }
  }, [experts, editing]);

  const filtered = useMemo(() => {
    return experts
      .filter((expert) => {
        if (regionFilter !== "all" && expert.region !== regionFilter) return false;
        if (domainFilter !== "all" && expert.domain !== domainFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const regionDiff =
          (REGION_ORDER.get(a.region) ?? 99) - (REGION_ORDER.get(b.region) ?? 99);
        if (regionDiff !== 0) return regionDiff;
        return (DOMAIN_ORDER.get(a.domain) ?? 99) - (DOMAIN_ORDER.get(b.domain) ?? 99);
      });
  }, [experts, regionFilter, domainFilter]);

  const dirtyUpdates = useMemo(() => {
    return experts
      .map((expert) => {
        const draft = drafts[expert.id];
        if (!draft) return null;
        if (draft.name === expert.name && draft.email === expert.email) return null;
        return { id: expert.id, name: draft.name, email: draft.email };
      })
      .filter((row): row is { id: string; name: string; email: string } => row !== null);
  }, [drafts, experts]);

  function updateDraft(id: string, field: keyof ExpertDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    setSaved(false);
    setError(null);
  }

  function handleCancel() {
    setDrafts(toDrafts(experts));
    setEditing(false);
    setError(null);
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveExperts(dirtyUpdates);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  <span className="inline-flex items-center gap-2">
                    <RegionFlag region={region} />
                    {region}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {DOMAINS.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {experts.length} contacts
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && !editing && !error && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              Saved
            </p>
          )}
          {editing ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isPending || dirtyUpdates.length === 0}
              >
                <Check className="h-4 w-4" />
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit table
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((expert) => {
              const draft = drafts[expert.id] ?? { name: expert.name, email: expert.email };
              return (
                <TableRow key={expert.id}>
                  <TableCell>
                    <RegionBadge region={expert.region} />
                  </TableCell>
                  <TableCell>{expert.domain}</TableCell>
                  <TableCell className={editing ? "font-normal" : "font-medium"}>
                    {editing ? (
                      <Input
                        value={draft.name}
                        onChange={(e) => updateDraft(expert.id, "name", e.target.value)}
                        className="h-9"
                        aria-label={`Name for ${expert.region} ${expert.domain}`}
                      />
                    ) : (
                      expert.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <Input
                        type="email"
                        value={draft.email}
                        onChange={(e) => updateDraft(expert.id, "email", e.target.value)}
                        className="h-9"
                        aria-label={`Email for ${expert.region} ${expert.domain}`}
                      />
                    ) : (
                      <a
                        href={`mailto:${expert.email}`}
                        className="text-sm text-foreground underline-offset-4 hover:underline"
                      >
                        {expert.email}
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No expert contacts match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
