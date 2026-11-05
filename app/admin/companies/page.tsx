import { requireRole } from "@/lib/auth";
import type { Metadata } from "next";
import { count, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Companies" };

export default async function AdminCompaniesPage() {
  await requireRole("admin");
  const db = getDb();
  const rows = await db
    .select({
      id: schema.organisations.id,
      name: schema.organisations.name,
      type: schema.organisations.type,
      email: schema.organisations.companyEmail,
      createdAt: schema.organisations.createdAt,
      users: count(schema.users.id),
    })
    .from(schema.organisations)
    .leftJoin(schema.users, eq(schema.users.organisationId, schema.organisations.id))
    .groupBy(schema.organisations.id)
    .orderBy(desc(schema.organisations.createdAt));

  return (
    <>
      <PageHeader title="Companies" description="Client companies and consulting partners registered on the platform." />
      <DataTable headers={["Name", "Type", "Company email", "Users", "Registered"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="font-medium text-white">{r.name}</td>
            <td className="capitalize text-slate-400">{r.type.replace("_", " ")}</td>
            <td className="text-slate-400">{r.email ?? "—"}</td>
            <td className="text-slate-300">{r.users}</td>
            <td className="text-slate-400">{formatDate(r.createdAt)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
