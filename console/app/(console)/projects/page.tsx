import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { ButtonLink, DataTable, PageHeader, TextLink } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requireOwner();
  const p = schema.projects;
  const rows = await getDb()
    .select({
      id: p.id,
      name: p.name,
      startDate: p.startDate,
      durationWeeks: p.durationWeeks,
      companyId: schema.organisations.id,
      company: schema.organisations.name,
      requests: sql<number>`(select count(*)::int from ${schema.resourceRequests} where ${schema.resourceRequests.projectId} = ${p.id})`,
      assigned: sql<number>`(select count(*)::int from ${schema.assignedResources} where ${schema.assignedResources.projectId} = ${p.id})`,
    })
    .from(p)
    .innerJoin(schema.organisations, eq(schema.organisations.id, p.organisationId))
    .orderBy(desc(p.createdAt));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Client engagements that resource requests and placements hang off."
        actions={
          <ButtonLink href="/projects/new">
            <Plus size={15} /> New project
          </ButtonLink>
        }
      />
      <DataTable headers={["Project", "Company", "Start", "Duration", "Requests", "Assigned"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <TextLink href={`/projects/${r.id}`}>{r.name}</TextLink>
            </td>
            <td>
              <TextLink href={`/companies/${r.companyId}`} className="font-normal text-slate-600">
                {r.company}
              </TextLink>
            </td>
            <td className="text-slate-600">{formatDate(r.startDate)}</td>
            <td className="text-slate-600">{r.durationWeeks ? `${r.durationWeeks} weeks` : "—"}</td>
            <td className="text-slate-600">{r.requests}</td>
            <td className="text-slate-600">{r.assigned}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
