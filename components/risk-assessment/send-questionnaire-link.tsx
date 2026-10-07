"use client";

import { Button } from "@/components/ui/button";
import { buildQuestionnaireMailto } from "@/lib/questionnaire";
import { Mail } from "lucide-react";

interface SendQuestionnaireLinkProps {
  token: string | null;
  contactEmail?: string | null;
  vendorName: string;
  /** "send" for the create dialog; "reminder" for open assessments in the list */
  mode?: "send" | "reminder";
}

export function SendQuestionnaireLink({
  token,
  contactEmail,
  vendorName,
  mode = "send",
}: SendQuestionnaireLinkProps) {
  if (!token) return null;

  const href = buildQuestionnaireMailto({
    email: contactEmail,
    vendorName,
    token,
    mode,
  });

  if (!href) {
    return (
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" disabled title="No contact email">
        <Mail className="h-3.5 w-3.5" />
        {mode === "reminder" ? "Send reminder" : "Send"}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
      <a href={href}>
        <Mail className="h-3.5 w-3.5" />
        {mode === "reminder" ? "Send reminder" : "Send"}
      </a>
    </Button>
  );
}
