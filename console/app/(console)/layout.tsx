import Link from "next/link";
import { count, eq, inArray } from "drizzle-orm";
import { ExternalLink, LogOut, Search } from "lucide-react";
import { getDb, schema } from "@dx/db";
import { ConsoleWordmark } from "@/components/logo";
import { SidebarNav } from "@/components/sidebar-nav";
import { requireOwner } from "@/lib/auth";
import { signOut } from "../login/actions";

export default async function ConsoleLayout({ children }: LayoutProps<"/">) {
  const owner = await requireOwner();
  const db = getDb();
  const [[screening], [requests], [contacts]] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.resourceProfiles)
      .where(inArray(schema.resourceProfiles.status, ["submitted", "screening"])),
    db.select({ n: count() }).from(schema.resourceRequests).where(eq(schema.resourceRequests.status, "new")),
    db.select({ n: count() }).from(schema.contactRequests).where(eq(schema.contactRequests.status, "new")),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy-950 px-3 py-5 lg:flex">
        <Link href="/" className="mb-8 px-3">
          <ConsoleWordmark dark />
        </Link>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav
            groups={[
              { items: [{ href: "/", label: "Dashboard", icon: "dashboard" }] },
              {
                title: "Incoming",
                items: [
                  { href: "/screening", label: "Screening queue", icon: "screening", count: screening.n },
                  { href: "/requests", label: "Resource requests", icon: "requests", count: requests.n },
                  { href: "/contacts", label: "Contact enquiries", icon: "contacts", count: contacts.n },
                ],
              },
              {
                title: "Records",
                items: [
                  { href: "/candidates", label: "Candidates", icon: "candidates" },
                  { href: "/companies", label: "Companies", icon: "companies" },
                  { href: "/projects", label: "Projects", icon: "projects" },
                ],
              },
              {
                title: "Settings",
                items: [
                  { href: "/reference", label: "Reference data", icon: "reference" },
                  { href: "/activity", label: "Activity log", icon: "activity" },
                ],
              },
            ]}
          />
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white"
          >
            <ExternalLink size={13} /> Open public site
          </a>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
          <Link href="/" className="lg:hidden">
            <ConsoleWordmark />
          </Link>
          <form action="/search" className="relative max-w-md flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              placeholder="Search candidates, companies, requests, enquiries…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
            />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{owner.email}</span>
            <form action={signOut}>
              <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                <LogOut size={14} /> Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
