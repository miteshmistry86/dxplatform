import type { Metadata } from "next";
import { count, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, schema } from "@dx/db";
import { DataTable, FilterTabs, PageHeader, StatusSelect, TextLink } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, ROLE_LABELS, formatDate, timeAgo } from "@/lib/utils";
import { setRequestStatus } from "../../actions";

export const metadata: Metadata = { title: "Resource requests" };

const STATUSES = schema.requestStatus.enumValues;

export default async function RequestsPage({ searchParams }: PageProps<"/requests">) {
  await requireOwner();
  const { status } = await searchParams;
  const filter = STATUSES.find((s) => s === status);
  const rr = schema.resourceRequests;
  const target = alias(schema.people, "target");
  const db = getDb();

  const [rows, counts] = await Promise.all([
    db
      .select({
        id: rr.id,
        role: rr.roleRequired,
        status: rr.status,
        startDate: rr.startDate,
        endDate: rr.endDate,
        createdAt: rr.createdAt,
        companyId: schema.organisations.id,
        company: schema.organisations.name,
        project: schema.projects.name,
        requestedBy: schema.users.email,
        targetFirst: target.firstName,
        targetLast: target.lastName,
        shortlisted: sql<number>`(select count(*)::int from ${schema.shortlistedResources} where ${schema.shortlistedResources.resourceRequestId} = ${rr.id})`,
      })
      .from(rr)
      .innerJoin(schema.organisations, eq(schema.organisations.id, rr.organisationId))
      .leftJoin(schema.projects, eq(schema.projects.id, rr.projectId))
      .leftJoin(schema.users, eq(schema.users.id, rr.requestedByUserId))
      .leftJoin(target, eq(target.id, rr.targetPersonId))
      .where(filter ? eq(rr.status, filter) : undefined)
      .orderBy(desc(rr.createdAt)),
    db.select({ status: rr.status, n: count() }).from(rr).groupBy(rr.status),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <>
      <PageHeader title="Resource requests" description="What companies have asked for. Open one to shortlist and assign talent." />
      <FilterTabs
        base="/requests"
        current={filter}
        options={[{ label: "All" }, ...STATUSES.map((s) => ({ value: s, label: REQUEST_STATUS_LABELS[s], count: countFor(s) }))]}
      />
      <DataTable headers={["Request", "Company", "Dates", "Shortlisted", "Raised", "Status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <TextLink href={`/requests/${r.id}`}>{ROLE_LABELS[r.role]}</TextLink>
              {r.targetFirst && (
                <p className="text-xs text-slate-500">
                  Asked for {r.targetFirst} {r.targetLast}
                </p>
              )}
              {r.project && <p className="text-xs text-slate-400">{r.project}</p>}
            </td>
            <td>
              <TextLink href={`/companies/${r.companyId}`} className="font-normal text-slate-700">
                {r.company}
              </TextLink>
              {r.requestedBy && <p className="text-xs text-slate-400">{r.requestedBy}</p>}
            </td>
            <td className="text-slate-600">
              {r.startDate ? `${formatDate(r.startDate)} – ${formatDate(r.endDate)}` : "Flexible"}
            </td>
            <td className="text-slate-600">{r.shortlisted}</td>
            <td className="text-slate-600" title={formatDate(r.createdAt)}>
              {timeAgo(r.createdAt)}
            </td>
            <td>
              <StatusSelect id={r.id} value={r.status} action={setRequestStatus} options={REQUEST_STATUS_LABELS} />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
