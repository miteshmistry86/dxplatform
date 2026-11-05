import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { DataTable, PageHeader, TextLink } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { describeAction } from "@/lib/activity";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity log" };

const ENTITY_LINKS: Record<string, string> = {
  organisations: "/companies",
  people: "/candidates",
  projects: "/projects",
  resource_requests: "/requests",
  resource_profiles: "/screening",
};

export default async function ActivityPage() {
  await requireOwner();
  const rows = await getDb()
    .select({
      id: schema.auditLog.id,
      action: schema.auditLog.action,
      entity: schema.auditLog.entity,
      entityId: schema.auditLog.entityId,
      data: schema.auditLog.data,
      at: schema.auditLog.createdAt,
      actor: schema.users.email,
    })
    .from(schema.auditLog)
    .leftJoin(schema.users, eq(schema.users.id, schema.auditLog.actorUserId))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(300);

  return (
    <>
      <PageHeader title="Activity log" description="Every change made in the console and the portals, newest first." />
      <DataTable headers={["When", "Who", "What", ""]} empty={rows.length === 0}>
        {rows.map((r) => {
          const base = ENTITY_LINKS[r.entity];
          return (
            <tr key={r.id}>
              <td className="whitespace-nowrap text-slate-500">{formatDateTime(r.at)}</td>
              <td className="text-slate-600">{r.actor ?? "System"}</td>
              <td className="text-slate-800">{describeAction(r.action, r.data)}</td>
              <td className="text-right">
                {base && r.entityId && <TextLink href={`${base}/${r.entityId}`}>Open</TextLink>}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
