"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Briefcase,
  Building2,
  ClipboardCheck,
  Database,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  screening: ClipboardCheck,
  candidates: Users,
  companies: Building2,
  projects: FolderKanban,
  requests: Briefcase,
  contacts: Inbox,
  reference: Database,
  activity: Activity,
};

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  count?: number;
}

export function SidebarNav({ groups }: { groups: { title?: string; items: NavItem[] }[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {groups.map((group, i) => (
        <div key={group.title ?? i}>
          {group.title && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{group.title}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                      active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon size={16} className={active ? "text-cyan-300" : "text-slate-400"} />
                    <span className="flex-1">{item.label}</span>
                    {!!item.count && (
                      <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                        {item.count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
