import { getTprmPolicy } from "@/lib/queries";
import { PolicySettingsClient } from "@/components/policy/policy-settings-client";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function PolicyPage() {
  const policy = await getTprmPolicy();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Policy"
        description="Define TPRM review frequency by inherent risk. These intervals drive next review dates and overdue status across vendors."
      />
      <PolicySettingsClient policy={policy} />
    </div>
  );
}
