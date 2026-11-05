import Link from "next/link";
import { count, desc, eq, gte, inArray } from "drizzle-orm";
import { Briefcase, Building2, ClipboardCheck, Inbox, UserCheck, UserPlus } from "lucide-react";
import { getDb, schema } from "@dx/db";
import { Badge, Card, CardTitle, Empty, PageHeader, statusTone, type Tone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { describeAction } from "@/lib/activity";
import { PROFILE_STATUS_LABELS, ROLE_LABELS, daysAgo, timeAgo } from "@/lib/utils";

interface InboxItem {
  key: string;
  kind: string;
  tone: Tone;
  title: string;
  detail: string;
  href: string;
  at: Date;
}

export default async function DashboardPage() {
  const owner = await requireOwner();
  const db = getDb();
  const since = daysAgo(30);
  const { resourceProfiles: rp, people, resourceRequests: rr, organisations: org, contactRequests: cr, assignedResources } = schema;

  const [
    [awaiting],
    [listed],
    [openRequests],
    [newContacts],
    [clients],
    [assigned],
    [newCandidates30],
    [newRequests30],
    [newCompanies30],
    submitted,
    requests,
    contacts,
    companies,
    activity,
  ] = await Promise.all([
    db.select({ n: count() }).from(rp).where(inArray(rp.status, ["submitted", "screening"])),
    db.select({ n: count() }).from(rp).where(eq(rp.status, "listed")),
    db.select({ n: count() }).from(rr).where(inArray(rr.status, ["new", "in_review", "matching"])),
    db.select({ n: count() }).from(cr).where(eq(cr.status, "new")),
    db.select({ n: count() }).from(org).where(eq(org.type, "client_company")),
    db.select({ n: count() }).from(assignedResources),
    db.select({ n: count() }).from(rp).where(gte(rp.createdAt, since)),
    db.select({ n: count() }).from(rr).where(gte(rr.createdAt, since)),
    db.select({ n: count() }).from(org).where(gte(org.createdAt, since)),
    db
      .select({ id: rp.id, status: rp.status, role: rp.primaryRole, at: rp.submittedAt, updatedAt: rp.updatedAt, firstName: people.firstName, lastName: people.lastName })
      .from(rp)
      .innerJoin(people, eq(people.id, rp.personId))
      .where(inArray(rp.status, ["submitted", "screening"]))
      .orderBy(desc(rp.updatedAt))
      .limit(8),
    db
      .select({ id: rr.id, role: rr.roleRequired, status: rr.status, at: rr.createdAt, company: org.name })
      .from(rr)
      .innerJoin(org, eq(org.id, rr.organisationId))
      .where(eq(rr.status, "new"))
      .orderBy(desc(rr.createdAt))
      .limit(8),
    db.select().from(cr).where(eq(cr.status, "new")).orderBy(desc(cr.createdAt)).limit(8),
    db
      .select({ id: org.id, name: org.name, type: org.type, at: org.createdAt })
      .from(org)
      .where(gte(org.createdAt, daysAgo(14)))
      .orderBy(desc(org.createdAt))
      .limit(5),
    db
      .select({ id: schema.auditLog.id, action: schema.auditLog.action, data: schema.auditLog.data, at: schema.auditLog.createdAt, actor: schema.users.email })
      .from(schema.auditLog)
      .leftJoin(schema.users, eq(schema.users.id, schema.auditLog.actorUserId))
      .orderBy(desc(schema.auditLog.createdAt))
      .limit(10),
  ]);

  const inbox: InboxItem[] = [
    ...submitted.map((p) => ({
      key: `p-${p.id}`,
      kind: PROFILE_STATUS_LABELS[p.status],
      tone: statusTone(p.status),
      title: `${p.firstName} ${p.lastName}`,
      detail: p.role ? `${ROLE_LABELS[p.role]} profile` : "Candidate profile",
      href: `/screening/${p.id}`,
      at: p.at ?? p.updatedAt,
    })),
    ...requests.map((r) => ({
      key: `r-${r.id}`,
      kind: "Resource request",
      tone: "brand" as Tone,
      title: r.company,
      detail: `Needs a ${ROLE_LABELS[r.role]}`,
      href: `/requests/${r.id}`,
      at: r.at,
    })),
    ...contacts.map((c) => ({
      key: `c-${c.id}`,
      kind: "Enquiry",
      tone: "warning" as Tone,
      title: c.company ? `${c.name} · ${c.company}` : c.name,
      detail: c.interest ?? c.message.slice(0, 80),
      href: `/contacts?open=${c.id}`,
      at: c.createdAt,
    })),
    ...companies.map((o) => ({
      key: `o-${o.id}`,
      kind: o.type === "client_company" ? "New client" : "New partner",
      tone: "success" as Tone,
      title: o.name,
      detail: "Company signed up",
      href: `/companies/${o.id}`,
      at: o.at,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const tiles = [
    { label: "Awaiting screening", value: awaiting.n, href: "/screening", icon: ClipboardCheck, accent: "text-sky-600 bg-sky-50" },
    { label: "Open requests", value: openRequests.n, href: "/requests", icon: Briefcase, accent: "text-indigo-600 bg-indigo-50" },
    { label: "New enquiries", value: newContacts.n, href: "/contacts", icon: Inbox, accent: "text-amber-600 bg-amber-50" },
    { label: "Listed talent", value: listed.n, href: "/candidates?status=listed", icon: UserCheck, accent: "text-emerald-600 bg-emerald-50" },
    { label: "Client companies", value: clients.n, href: "/companies", icon: Building2, accent: "text-violet-600 bg-violet-50" },
    { label: "Placements", value: assigned.n, href: "/projects", icon: UserPlus, accent: "text-cyan-600 bg-cyan-50" },
  ];

  const firstName = owner.email.split("@")[0].split(/[._-]/)[0];

  return (
    <>
      <PageHeader
        title={`Hello ${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`}
        description="Here is what has come in and what needs a decision."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className="h-full transition hover:border-indigo-300 hover:shadow">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${t.accent}`}>
                <t.icon size={18} />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{t.value}</p>
              <p className="mt-1 text-sm text-slate-500">{t.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle>Needs attention</CardTitle>
          {inbox.length === 0 ? (
            <Empty>All caught up. Nothing new is waiting.</Empty>
          ) : (
            <ul className="-mx-2 divide-y divide-slate-100">
              {inbox.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="flex items-center gap-4 rounded-lg px-2 py-3 hover:bg-slate-50">
                    <Badge tone={item.tone} className="w-32 justify-center">
                      {item.kind}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{item.title}</p>
                      <p className="truncate text-sm text-slate-500">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{timeAgo(item.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Last 30 days</CardTitle>
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Candidates", value: newCandidates30.n },
                { label: "Requests", value: newRequests30.n },
                { label: "Companies", value: newCompanies30.n },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 py-3">
                  <dd className="text-2xl font-semibold text-slate-900">{s.value}</dd>
                  <dt className="text-xs text-slate-500">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardTitle actions={<Link href="/activity" className="text-xs text-indigo-600 hover:text-indigo-800">View all</Link>}>
              Recent activity
            </CardTitle>
            {activity.length === 0 ? (
              <Empty>No activity yet.</Empty>
            ) : (
              <ol className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="text-slate-700">{describeAction(a.action, a.data)}</p>
                    <p className="text-xs text-slate-400">
                      {a.actor ?? "System"} · {timeAgo(a.at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
