import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { count, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Badge, Card, Empty, FilterTabs, PageHeader, StatusSelect, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { CONTACT_STATUS_LABELS, formatDateTime, timeAgo } from "@/lib/utils";
import { setContactStatus } from "../../actions";

export const metadata: Metadata = { title: "Contact enquiries" };

const STATUSES = schema.contactRequestStatus.enumValues;

export default async function ContactsPage({ searchParams }: PageProps<"/contacts">) {
  await requireOwner();
  const { status, open } = await searchParams;
  const filter = STATUSES.find((s) => s === status);
  const cr = schema.contactRequests;
  const db = getDb();

  const [rows, counts] = await Promise.all([
    db.select().from(cr).where(filter ? eq(cr.status, filter) : undefined).orderBy(desc(cr.createdAt)).limit(300),
    db.select({ status: cr.status, n: count() }).from(cr).groupBy(cr.status),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <>
      <PageHeader title="Contact enquiries" description="Messages sent through the public site's contact form." />
      <FilterTabs
        base="/contacts"
        current={filter}
        options={[{ label: "All" }, ...STATUSES.map((s) => ({ value: s, label: CONTACT_STATUS_LABELS[s], count: countFor(s) }))]}
      />
      {rows.length === 0 ? (
        <Card>
          <Empty>No enquiries here.</Empty>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <details key={c.id} open={open === c.id || c.status === "new"} className="group rounded-xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4">
                <Badge tone={statusTone(c.status)} className="w-24 justify-center">
                  {CONTACT_STATUS_LABELS[c.status]}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {c.name}
                    {c.company && <span className="font-normal text-slate-500"> · {c.company}</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">{c.interest ?? c.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400" title={formatDateTime(c.createdAt)}>
                  {timeAgo(c.createdAt)}
                </span>
              </summary>
              <div className="border-t border-slate-100 px-5 py-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{c.message}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a href={`mailto:${c.email}?subject=${encodeURIComponent("Re: your Developer Exchange enquiry")}`} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800">
                      <Mail size={14} /> {c.email}
                    </a>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={14} /> {c.phone}
                      </a>
                    )}
                  </div>
                  <StatusSelect id={c.id} value={c.status} action={setContactStatus} options={CONTACT_STATUS_LABELS} />
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
