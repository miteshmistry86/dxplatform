"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/requests", label: "Resource requests", icon: Briefcase },
] as const;

export function TopTabs({ newRequests }: { newRequests: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Records" className="flex gap-1 overflow-x-auto px-4">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition",
              active
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
            )}
          >
            <Icon size={15} />
            {tab.label}
            {tab.href === "/requests" && newRequests > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500",
                )}
              >
                {newRequests}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
