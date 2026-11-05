import { requireRole } from "@/lib/auth";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DataTable, StatusSelect } from "@/components/data-table";
import { PageHeader } from "@/components/ui";
import { STATUS_LABELS, formatDate } from "@/lib/utils";
import { setContactStatus } from "../actions";

export const metadata: Metadata = { title: "Contact requests" };

export default async function AdminContactsPage() {
  await requireRole("admin");
  const rows = await getDb()
    .select()
    .from(schema.contactRequests)
    .orderBy(desc(schema.contactRequests.createdAt))
    .limit(200);

  return (
    <>
      <PageHeader title="Contact requests" description="Messages submitted through the public contact form." />
      <DataTable headers={["From", "Interest", "Message", "Received", "Status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <p className="font-medium text-white">{r.name}</p>
              <a href={`mailto:${r.email}`} className="text-xs text-indigo-300 hover:text-white">
                {r.email}
              </a>
              {r.company && <p className="text-xs text-slate-500">{r.company}</p>}
            </td>
            <td className="capitalize text-slate-400">{r.interest ?? "—"}</td>
            <td className="max-w-md whitespace-pre-line text-slate-300">{r.message}</td>
            <td className="whitespace-nowrap text-slate-400">{formatDate(r.createdAt)}</td>
            <td>
              <StatusSelect
                id={r.id}
                value={r.status}
                action={setContactStatus}
                options={schema.contactRequestStatus.enumValues.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
