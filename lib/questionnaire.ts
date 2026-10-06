export type QuestionnaireAnswer = "yes" | "partial" | "no" | "na";

export const QUESTIONNAIRE_ANSWER_LABELS: Record<QuestionnaireAnswer, string> = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
  na: "N/A",
};

interface QuestionnaireQuestion {
  id: string;
  category: string;
  text: string;
}

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  { id: "gov-1", category: "Governance & Risk Management", text: "Does the vendor maintain a formal information security policy approved by senior management?" },
  { id: "gov-2", category: "Governance & Risk Management", text: "Is there a designated individual responsible for information security governance?" },
  { id: "gov-3", category: "Governance & Risk Management", text: "Does the vendor conduct regular risk assessments of their security posture?" },
  { id: "acc-1", category: "Access Control", text: "Does the vendor enforce multi-factor authentication for privileged access?" },
  { id: "acc-2", category: "Access Control", text: "Are user access rights reviewed periodically?" },
  { id: "acc-3", category: "Access Control", text: "Is the principle of least privilege applied to system access?" },
  { id: "dat-1", category: "Data Protection & Privacy", text: "Is sensitive data encrypted at rest?" },
  { id: "dat-2", category: "Data Protection & Privacy", text: "Is sensitive data encrypted in transit?" },
  { id: "dat-3", category: "Data Protection & Privacy", text: "Does the vendor comply with applicable data protection regulations (e.g. GDPR)?" },
  { id: "net-1", category: "Network & Infrastructure Security", text: "Is network segmentation implemented to isolate critical systems?" },
  { id: "net-2", category: "Network & Infrastructure Security", text: "Are firewalls and intrusion detection or prevention systems in place?" },
  { id: "net-3", category: "Network & Infrastructure Security", text: "Is vulnerability scanning performed on a regular schedule?" },
  { id: "app-1", category: "Application Security", text: "Does the vendor follow secure software development lifecycle practices?" },
  { id: "app-2", category: "Application Security", text: "Are applications tested for security vulnerabilities before deployment?" },
  { id: "app-3", category: "Application Security", text: "Is there a patch management process for applications and systems?" },
  { id: "inc-1", category: "Incident Response", text: "Does the vendor have a documented incident response plan?" },
  { id: "inc-2", category: "Incident Response", text: "Are security incidents reported to clients within a defined timeframe?" },
  { id: "inc-3", category: "Incident Response", text: "Does the vendor conduct post-incident reviews and remediation?" },
  { id: "bcp-1", category: "Business Continuity & Disaster Recovery", text: "Is there a business continuity plan that is tested annually?" },
  { id: "bcp-2", category: "Business Continuity & Disaster Recovery", text: "Are backups performed regularly and restoration tested?" },
  { id: "bcp-3", category: "Business Continuity & Disaster Recovery", text: "Does the vendor have defined RTO/RPO objectives for critical services?" },
  { id: "tpc-1", category: "Third-Party & Supply Chain", text: "Does the vendor assess security risks of their own sub-processors?" },
  { id: "tpc-2", category: "Third-Party & Supply Chain", text: "Are contractual security requirements imposed on fourth parties?" },
  { id: "tpc-3", category: "Third-Party & Supply Chain", text: "Is there an inventory of third parties with access to client data?" },
  { id: "cmp-1", category: "Compliance & Audit", text: "Does the vendor hold relevant security certifications (e.g. ISO 27001, SOC 2)?" },
  { id: "cmp-2", category: "Compliance & Audit", text: "Are independent security audits conducted at least annually?" },
  { id: "cmp-3", category: "Compliance & Audit", text: "Does the vendor maintain evidence of compliance for regulatory requirements?" },
  { id: "per-1", category: "Personnel & Physical Security", text: "Are background checks performed for employees with access to client data?" },
  { id: "per-2", category: "Personnel & Physical Security", text: "Is security awareness training provided to all personnel annually?" },
  { id: "per-3", category: "Personnel & Physical Security", text: "Are physical access controls implemented for data centers and offices?" },
];

export const QUESTIONNAIRE_CATEGORIES = Array.from(
  new Set(QUESTIONNAIRE_QUESTIONS.map((q) => q.category))
);

/** Security score per answer: 100 means strong controls and lower risk. */
const ANSWER_SCORES: Record<Exclude<QuestionnaireAnswer, "na">, number> = {
  yes: 100,
  partial: 50,
  no: 0,
};

const VALID_ANSWERS = new Set<string>(Object.keys(QUESTIONNAIRE_ANSWER_LABELS));

export function isCompleteResponseSet(
  responses: Record<string, unknown> | null | undefined
): responses is Record<string, QuestionnaireAnswer> {
  if (!responses) return false;
  return QUESTIONNAIRE_QUESTIONS.every((q) => {
    const answer = responses[q.id];
    return typeof answer === "string" && VALID_ANSWERS.has(answer);
  });
}

export function calculateSecurityScore(responses: Record<string, QuestionnaireAnswer>): number {
  const scores = QUESTIONNAIRE_QUESTIONS.map((q) => responses[q.id])
    .filter((answer): answer is Exclude<QuestionnaireAnswer, "na"> => answer !== undefined && answer !== "na")
    .map((answer) => ANSWER_SCORES[answer]);

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/** Client-side only: links are built from the origin the user is actually on. */
export function getQuestionnaireUrl(token: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/questionnaire/${token}`;
}
