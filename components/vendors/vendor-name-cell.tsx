import { VendorAvatar } from "@/components/vendors/vendor-avatar";

interface VendorNameCellProps {
  name?: string | null;
  contactEmail?: string | null;
}

export function VendorNameCell({ name, contactEmail }: VendorNameCellProps) {
  if (!name) return <>—</>;

  return (
    <div className="flex items-center gap-3">
      <VendorAvatar name={name} contactEmail={contactEmail} size="sm" />
      <span>{name}</span>
    </div>
  );
}
