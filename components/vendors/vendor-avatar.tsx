"use client";

import { useMemo, useState } from "react";
import {
  getVendorDomain,
  getVendorFaviconUrl,
  getVendorIconUrl,
  getVendorInitials,
} from "@/lib/vendor-logo";
import { cn } from "@/lib/utils";

type LogoStage = "icon" | "favicon" | "initials";

interface VendorAvatarProps {
  name: string;
  contactEmail?: string | null;
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
};

export function VendorAvatar({
  name,
  contactEmail,
  className,
  size = "md",
}: VendorAvatarProps) {
  const domain = useMemo(() => getVendorDomain(name, contactEmail), [name, contactEmail]);
  const initials = useMemo(() => getVendorInitials(name), [name]);
  const [stage, setStage] = useState<LogoStage>(domain ? "icon" : "initials");

  const imageSrc =
    stage === "icon" && domain
      ? getVendorIconUrl(domain)
      : stage === "favicon" && domain
        ? getVendorFaviconUrl(domain)
        : null;

  function handleImageError() {
    if (stage === "icon") {
      setStage("favicon");
      return;
    }
    setStage("initials");
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md border border-border/80 bg-white",
        sizeClasses[size],
        className
      )}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={`${name} logo`}
          className="h-full w-full object-contain p-1"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 font-semibold text-neutral-600">
          {initials}
        </div>
      )}
    </div>
  );
}
