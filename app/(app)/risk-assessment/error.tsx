"use client";

import { Button } from "@/components/ui/button";

export default function RiskAssessmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Unable to load risk assessments</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Something went wrong while loading the page."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
