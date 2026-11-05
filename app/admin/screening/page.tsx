import { requireRole } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DataTable } from "@/components/data-table";
import { Badge, PageHeader, statusTone } from "@/components/ui";
import { ROLE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Screening queue" };

export default async function ScreeningQueuePage() {
  await requireRole("admin");
  const rows = await getDb()
    .select({
      id: schema.resourceProfiles.id,
      status: schema.resourceProfiles.status,
      role: schema.resourceProfiles.primaryRole,
      headline: schema.resourceProfiles.headline,
      submittedAt: schema.resourceProfiles.submittedAt,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      country: schema.people.country,
    })
    .from(schema.resourceProfiles)
    .innerJoin(schema.people, eq(schema.people.id, schema.resourceProfiles.personId))
    .where(inArray(schema.resourceProfiles.status, ["submitted", "screening"]))
    .orderBy(asc(schema.resourceProfiles.submittedAt));

  return (
    <>
      <PageHeader title="Screening queue" description="Profiles submitted for CTA screening, oldest first." />
      <DataTable headers={["Name", "Role", "Headline", "Country", "Submitted", "Status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-white/[0.02]">
            <td>
              <Link href={`/admin/screening/${r.id}`} className="font-medium text-indigo-300 hover:text-white">
                {r.firstName} {r.lastName}
              </Link>
            </td>
            <td className="text-slate-300">{r.role ? ROLE_LABELS[r.role] : "—"}</td>
            <td className="max-w-xs truncate text-slate-400">{r.headline}</td>
            <td className="text-slate-400">{r.country ?? "—"}</td>
            <td className="text-slate-400">{formatDate(r.submittedAt)}</td>
            <td>
              <Badge tone={statusTone(r.status)}>{STATUS_LABELS[r.status]}</Badge>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
