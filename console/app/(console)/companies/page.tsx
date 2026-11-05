import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Badge, ButtonLink, DataTable, FilterTabs, PageHeader, TextLink } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { ORG_TYPE_LABELS, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Companies" };

const TYPES = schema.organisationType.enumValues;

export default async function CompaniesPage({ searchParams }: PageProps<"/companies">) {
  await requireOwner();
  const { type, q } = await searchParams;
  const filter = TYPES.find((t) => t === type);
  const query = typeof q === "string" ? q.trim() : "";
  const org = schema.organisations;

  const rows = await getDb()
    .select({
      id: org.id,
      name: org.name,
      type: org.type,
      email: org.companyEmail,
      size: org.size,
      createdAt: org.createdAt,
      industry: schema.industries.name,
      people: sql<number>`(select count(*)::int from ${schema.people} where ${schema.people.organisationId} = ${org.id})`,
      openRequests: sql<number>`(select count(*)::int from ${schema.resourceRequests} where ${schema.resourceRequests.organisationId} = ${org.id} and ${schema.resourceRequests.status} in ('new','in_review','matching'))`,
    })
    .from(org)
    .leftJoin(schema.industries, eq(schema.industries.id, org.industryId))
    .where(and(filter ? eq(org.type, filter) : undefined, query ? ilike(org.name, `%${query}%`) : undefined))
    .orderBy(desc(org.createdAt));

  return (
    <>
      <PageHeader
        title="Companies"
        description="Clients who book talent and consulting partners who supply it."
        actions={
          <ButtonLink href="/companies/new">
            <Plus size={15} /> New company
          </ButtonLink>
        }
      />
      <form className="mb-4 max-w-md">
        {filter && <input type="hidden" name="type" value={filter} />}
        <input
          name="q"
          defaultValue={query}
          placeholder="Filter by company name"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500"
        />
      </form>
      <FilterTabs
        base="/companies"
        param="type"
        current={filter}
        extra={{ q: query || undefined }}
        options={[{ label: "All" }, ...TYPES.map((t) => ({ value: t, label: ORG_TYPE_LABELS[t] }))]}
      />
      <DataTable headers={["Company", "Type", "Industry", "Size", "People", "Open requests", "Joined"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <TextLink href={`/companies/${r.id}`}>{r.name}</TextLink>
              {r.email && <p className="text-xs text-slate-500">{r.email}</p>}
            </td>
            <td>
              <Badge tone={r.type === "client_company" ? "brand" : "neutral"}>{ORG_TYPE_LABELS[r.type]}</Badge>
            </td>
            <td className="text-slate-600">{r.industry ?? "—"}</td>
            <td className="text-slate-600">{r.size ?? "—"}</td>
            <td className="text-slate-600">{r.people}</td>
            <td>{r.openRequests > 0 ? <Badge tone="info">{r.openRequests}</Badge> : <span className="text-slate-400">0</span>}</td>
            <td className="text-slate-600">{formatDate(r.createdAt)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
