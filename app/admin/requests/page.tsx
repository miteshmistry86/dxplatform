import { requireRole } from "@/lib/auth";
import type { Metadata } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DataTable, StatusSelect } from "@/components/data-table";
import { PageHeader } from "@/components/ui";
import { LEVEL_LABELS, ROLE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";
import { setRequestStatus } from "../actions";

export const metadata: Metadata = { title: "Resource requests" };

export default async function AdminRequestsPage() {
  await requireRole("admin");
  const db = getDb();
  const rows = await db
    .select({
      id: schema.resourceRequests.id,
      role: schema.resourceRequests.roleRequired,
      status: schema.resourceRequests.status,
      description: schema.resourceRequests.description,
      startDate: schema.resourceRequests.startDate,
      endDate: schema.resourceRequests.endDate,
      createdAt: schema.resourceRequests.createdAt,
      company: schema.organisations.name,
      project: schema.projects.name,
      targetFirst: schema.people.firstName,
      targetLast: schema.people.lastName,
    })
    .from(schema.resourceRequests)
    .innerJoin(schema.organisations, eq(schema.organisations.id, schema.resourceRequests.organisationId))
    .leftJoin(schema.projects, eq(schema.projects.id, schema.resourceRequests.projectId))
    .leftJoin(schema.people, eq(schema.people.id, schema.resourceRequests.targetPersonId))
    .orderBy(desc(schema.resourceRequests.createdAt));

  const ids = rows.map((r) => r.id);
  const skillRows = ids.length
    ? await db
        .select({
          requestId: schema.skillRequirements.resourceRequestId,
          name: schema.skills.name,
          level: schema.skillRequirements.level,
        })
        .from(schema.skillRequirements)
        .innerJoin(schema.skills, eq(schema.skills.id, schema.skillRequirements.skillId))
        .where(inArray(schema.skillRequirements.resourceRequestId, ids))
    : [];
  const skillsByRequest = Map.groupBy(skillRows, (s) => s.requestId);

  return (
    <>
      <PageHeader title="Resource requests" description="Requirements and direct booking requests from client companies." />
      <DataTable headers={["Company", "Request", "Skills", "Dates", "Submitted", "Status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="font-medium text-white">{r.company}</td>
            <td className="max-w-xs">
              <p className="text-slate-200">
                {ROLE_LABELS[r.role]}
                {r.project && <span className="text-slate-400"> · {r.project}</span>}
              </p>
              {r.targetFirst && (
                <p className="text-xs text-cyan-300">
                  Requested: {r.targetFirst} {r.targetLast}
                </p>
              )}
              {r.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{r.description}</p>}
            </td>
            <td className="text-xs text-slate-400">
              {(skillsByRequest.get(r.id) ?? []).map((s) => `${s.name} (${LEVEL_LABELS[s.level]})`).join(", ") || "—"}
            </td>
            <td className="whitespace-nowrap text-slate-400">
              {formatDate(r.startDate)} – {formatDate(r.endDate)}
            </td>
            <td className="whitespace-nowrap text-slate-400">{formatDate(r.createdAt)}</td>
            <td>
              <StatusSelect
                id={r.id}
                value={r.status}
                action={setRequestStatus}
                options={schema.requestStatus.enumValues.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
