"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { getQuestionnaireUrl } from "@/lib/questionnaire";

interface CopyQuestionnaireLinkProps {
  token: string | null;
}

export function CopyQuestionnaireLink({ token }: CopyQuestionnaireLinkProps) {
  const [copied, setCopied] = useState(false);

  if (!token) return <span className="text-muted-foreground">—</span>;

  const url = getQuestionnaireUrl(token);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy questionnaire link:", url);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
