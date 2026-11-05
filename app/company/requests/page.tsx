import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Badge, ButtonLink, Card, Notice, PageHeader, statusTone } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { ROLE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Resource requests" };

export default async function CompanyRequestsPage({ searchParams }: PageProps<"/company/requests">) {
  const user = await requireRole("company_user");
  const { submitted } = await searchParams;

  const rows = await getDb()
    .select({
      id: schema.resourceRequests.id,
      role: schema.resourceRequests.roleRequired,
      status: schema.resourceRequests.status,
      startDate: schema.resourceRequests.startDate,
      endDate: schema.resourceRequests.endDate,
      createdAt: schema.resourceRequests.createdAt,
      targetPersonId: schema.resourceRequests.targetPersonId,
      project: schema.projects.name,
    })
    .from(schema.resourceRequests)
    .leftJoin(schema.projects, eq(schema.projects.id, schema.resourceRequests.projectId))
    .where(eq(schema.resourceRequests.organisationId, user.organisationId!))
    .orderBy(desc(schema.resourceRequests.createdAt));

  return (
    <>
      <PageHeader
        title="Resource requests"
        description="Track requests you've submitted to the Developer Exchange team."
        actions={<ButtonLink href="/company/requests/new">New request</ButtonLink>}
      />
      {submitted && (
        <div className="mb-6">
          <Notice tone="success">Request submitted. Our team will review it and start matching talent.</Notice>
        </div>
      )}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Dates</th>
              <th className="px-6 py-3">Submitted</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-3 text-slate-200">{r.project ?? (r.targetPersonId ? "Specific resource" : "—")}</td>
                <td className="px-6 py-3 text-slate-300">{ROLE_LABELS[r.role]}</td>
                <td className="px-6 py-3 text-slate-400">
                  {formatDate(r.startDate)} – {formatDate(r.endDate)}
                </td>
                <td className="px-6 py-3 text-slate-400">{formatDate(r.createdAt)}</td>
                <td className="px-6 py-3">
                  <Badge tone={statusTone(r.status)}>{STATUS_LABELS[r.status]}</Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
