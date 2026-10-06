"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Shield,
  Lightbulb,
  ShieldAlert,
  BarChart3,
  GitBranch,
  Layers,
  ScrollText,
  Megaphone,
  ListChecks,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/vendors", label: "Vendors", icon: Building2 },
      { href: "/fourth-parties", label: "Fourth Parties", icon: Layers },
      { href: "/risk-assessment", label: "Risk Assessments", icon: ClipboardList },
      { href: "/remediations", label: "Remediations", icon: Lightbulb },
    ],
  },
  {
    title: "Broadcast",
    items: [
      { href: "/broadcast/create", label: "Create Broadcast", icon: Megaphone },
      { href: "/broadcast/follow-up", label: "Follow-up", icon: ListChecks },
    ],
  },
  {
    title: "Cyber Risk",
    items: [
      { href: "/incidents", label: "Security Incidents", icon: ShieldAlert },
      { href: "/bitsight", label: "BitSight Ratings", icon: BarChart3 },
      { href: "/interconnections", label: "Interconnections", icon: GitBranch },
      {
        href: "https://cisowatch.vercel.app/",
        label: "CISO Watch",
        icon: Shield,
        external: true,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/policy", label: "Policy", icon: ScrollText },
      { href: "/experts", label: "Experts", icon: Users },
    ],
  },
];

function LinkedInIcon() {
  return (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A66C2] text-white shadow-[0_2px_6px_rgba(10,102,194,0.35)] ring-1 ring-white/10 transition-all group-hover:bg-[#004182] group-hover:shadow-[0_2px_8px_rgba(10,102,194,0.45)]">
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </span>
  );
}

function NavLink({ href, label, icon: Icon, external }: NavItem) {
  const pathname = usePathname();
  const isActive = !external && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const className = cn(
    "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors",
    isActive
      ? "bg-white font-medium text-neutral-900 shadow-sm"
      : "font-medium text-white/85 hover:bg-white/10 hover:text-white"
  );
  const icon = (
    <Icon
      className={cn("h-4 w-4 shrink-0", isActive ? "text-neutral-900" : "text-white/80")}
      strokeWidth={isActive ? 2 : 1.75}
    />
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {icon}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-sidebar text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_top_left,rgba(23,37,84,0.45),transparent_62%),radial-gradient(ellipse_90%_60%_at_bottom_right,rgba(15,23,42,0.35),transparent_70%)]"
        aria-hidden
      />
      <div className="relative border-b border-blue-950/40 px-5 py-6">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-800 via-blue-950 to-[#050a12] shadow-[0_6px_18px_rgba(15,23,42,0.55)] ring-1 ring-blue-400/20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.22),transparent_55%)]" />
            <Shield
              className="relative h-[22px] w-[22px] text-blue-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
              strokeWidth={1.65}
              fill="rgba(147,197,253,0.18)"
            />
          </div>
          <div className="min-w-0">
            <div className="font-serif text-[17px] font-normal leading-tight tracking-tight text-white">
              Trust Hub
            </div>
            <div className="mt-1 max-w-[155px] text-[9px] font-medium uppercase leading-snug tracking-[0.12em] text-white/45">
              Vendor Risk Intelligence Platform
            </div>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {navSections.map((section, index) => (
          <div key={section.title ?? index}>
            {section.title && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-blue-950/40 px-5 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
          Contact
        </p>
        <a
          href="https://www.linkedin.com/in/aureliengilles/"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-1.5 inline-flex items-center gap-2.5 text-[13px] font-medium text-white/75 transition-colors hover:text-white"
        >
          <span>Aurelien Gilles</span>
          <LinkedInIcon />
        </a>
      </div>
    </aside>
  );
}
