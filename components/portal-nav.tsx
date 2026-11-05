"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; exact?: boolean };

export function PortalNav({ items, horizontal }: { items: NavItem[]; horizontal?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn(horizontal ? "flex gap-1 overflow-x-auto" : "mt-2 flex flex-col gap-0.5")}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition",
              active ? "bg-brand-indigo/15 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
