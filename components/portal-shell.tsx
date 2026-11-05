import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { PortalNav, type NavItem } from "@/components/portal-nav";

export function PortalShell({
  label,
  nav,
  email,
  children,
}: {
  label: string;
  nav: NavItem[];
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-ink-950/60 px-4 py-6 md:flex">
        <Logo href="/dashboard" className="px-2" />
        <span className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <PortalNav items={nav} />
        <div className="mt-auto border-t border-white/5 pt-4">
          <p className="truncate px-3 text-xs text-slate-500">{email}</p>
          <form action={signOut}>
            <button className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 md:hidden">
          <Logo href="/dashboard" />
          <form action={signOut}>
            <button className="text-sm text-slate-400">Sign out</button>
          </form>
        </header>
        <div className="border-b border-white/5 px-4 py-2 md:hidden">
          <PortalNav items={nav} horizontal />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
