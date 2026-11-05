import { requireRole } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DataTable, StatusSelect } from "@/components/data-table";
import { PageHeader } from "@/components/ui";
import { ROLE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";
import { setProfileStatus } from "../actions";

export const metadata: Metadata = { title: "Developers" };

const STATUSES = schema.profileStatus.enumValues;

export default async function AdminDevelopersPage({ searchParams }: PageProps<"/admin/developers">) {
  await requireRole("admin");
  const { status } = await searchParams;
  const filter = STATUSES.find((s) => s === status);

  const rows = await getDb()
    .select({
      id: schema.resourceProfiles.id,
      status: schema.resourceProfiles.status,
      role: schema.resourceProfiles.primaryRole,
      updatedAt: schema.resourceProfiles.updatedAt,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      email: schema.people.email,
      type: schema.people.type,
      country: schema.people.country,
    })
    .from(schema.resourceProfiles)
    .innerJoin(schema.people, eq(schema.people.id, schema.resourceProfiles.personId))
    .where(filter ? eq(schema.resourceProfiles.status, filter) : undefined)
    .orderBy(desc(schema.resourceProfiles.updatedAt));

  return (
    <>
      <PageHeader title="Developers" description="All resource profiles across freelancers and partner resources." />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/developers?status=${s}` : "/admin/developers"}
            className={
              s === filter
                ? "rounded-full bg-brand-indigo/20 px-3 py-1 text-white"
                : "rounded-full border border-white/10 px-3 py-1 text-slate-400 hover:text-white"
            }
          >
            {s ? STATUS_LABELS[s] : "All"}
          </Link>
        ))}
      </div>
      <DataTable headers={["Name", "Email", "Type", "Role", "Country", "Updated", "Status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <Link href={`/admin/screening/${r.id}`} className="font-medium text-indigo-300 hover:text-white">
                {r.firstName} {r.lastName}
              </Link>
            </td>
            <td className="text-slate-400">{r.email}</td>
            <td className="capitalize text-slate-400">{r.type.replace("_", " ")}</td>
            <td className="text-slate-300">{r.role ? ROLE_LABELS[r.role] : "—"}</td>
            <td className="text-slate-400">{r.country ?? "—"}</td>
            <td className="text-slate-400">{formatDate(r.updatedAt)}</td>
            <td>
              <StatusSelect
                id={r.id}
                value={r.status}
                action={setProfileStatus}
                options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
