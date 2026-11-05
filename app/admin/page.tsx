import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { count, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Card, PageHeader } from "@/components/ui";

export default async function AdminHome() {
  await requireRole("admin");
  const db = getDb();
  const [[awaiting], [listed], [newRequests], [newContacts], [companies]] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.resourceProfiles)
      .where(inArray(schema.resourceProfiles.status, ["submitted", "screening"])),
    db.select({ n: count() }).from(schema.resourceProfiles).where(eq(schema.resourceProfiles.status, "listed")),
    db.select({ n: count() }).from(schema.resourceRequests).where(eq(schema.resourceRequests.status, "new")),
    db.select({ n: count() }).from(schema.contactRequests).where(eq(schema.contactRequests.status, "new")),
    db
      .select({ n: count() })
      .from(schema.organisations)
      .where(eq(schema.organisations.type, "client_company")),
  ]);

  const tiles = [
    { label: "Awaiting screening", value: awaiting.n, href: "/admin/screening" },
    { label: "Listed developers", value: listed.n, href: "/admin/developers?status=listed" },
    { label: "New resource requests", value: newRequests.n, href: "/admin/requests" },
    { label: "New contact requests", value: newContacts.n, href: "/admin/contacts" },
    { label: "Client companies", value: companies.n, href: "/admin/companies" },
  ];

  return (
    <>
      <PageHeader title="Platform overview" description="What needs attention across Developer Exchange." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className="transition hover:border-brand-indigo/40">
              <p className="text-sm text-slate-400">{t.label}</p>
              <p className="mt-2 text-4xl font-semibold text-white">{t.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
