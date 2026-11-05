import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getDb, schema } from "@dx/db";
import { Badge, ButtonLink, Card, CardTitle, PageHeader, TextLink, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getReferenceData } from "@/lib/queries";
import { ORG_TYPE_LABELS, PERSON_TYPE_LABELS, REQUEST_STATUS_LABELS, ROLE_LABELS, UUID_RE, formatDate } from "@/lib/utils";
import { OrganisationForm } from "../organisation-form";

export default async function CompanyPage({ params }: PageProps<"/companies/[id]">) {
  await requireOwner();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const db = getDb();
  const org = await db.query.organisations.findFirst({ where: eq(schema.organisations.id, id) });
  if (!org) notFound();

  const [ref, people, logins, projects, requests] = await Promise.all([
    getReferenceData(),
    db.select().from(schema.people).where(eq(schema.people.organisationId, id)).orderBy(asc(schema.people.lastName)),
    db
      .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role, createdAt: schema.users.createdAt })
      .from(schema.users)
      .where(eq(schema.users.organisationId, id)),
    db.select().from(schema.projects).where(eq(schema.projects.organisationId, id)).orderBy(desc(schema.projects.createdAt)),
    db.select().from(schema.resourceRequests).where(eq(schema.resourceRequests.organisationId, id)).orderBy(desc(schema.resourceRequests.createdAt)),
  ]);

  return (
    <>
      <PageHeader
        back={{ href: "/companies", label: "Companies" }}
        title={org.name}
        description={`${ORG_TYPE_LABELS[org.type]} · joined ${formatDate(org.createdAt)}`}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardTitle>Details</CardTitle>
          <OrganisationForm key={org.updatedAt.toISOString()} defaults={org} industries={ref.industries} />
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle>Resource requests</CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <TextLink href={`/requests/${r.id}`}>{ROLE_LABELS[r.roleRequired]}</TextLink>
                    <p className="text-xs text-slate-400">Raised {formatDate(r.createdAt)}</p>
                  </div>
                  <Badge tone={statusTone(r.status)}>{REQUEST_STATUS_LABELS[r.status]}</Badge>
                </li>
              ))}
              {requests.length === 0 && <li className="py-2 text-slate-400">No requests yet.</li>}
            </ul>
          </Card>
          <Card>
            <CardTitle
              actions={
                <ButtonLink href={`/projects/new?company=${org.id}`} variant="secondary" className="px-2.5 py-1 text-xs">
                  <Plus size={13} /> Project
                </ButtonLink>
              }
            >
              Projects
            </CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {projects.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <TextLink href={`/projects/${p.id}`}>{p.name}</TextLink>
                  <span className="text-slate-400">{formatDate(p.startDate)}</span>
                </li>
              ))}
              {projects.length === 0 && <li className="py-2 text-slate-400">No projects.</li>}
            </ul>
          </Card>
          <Card>
            <CardTitle>People</CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {people.map((p) => (
                <li key={p.id} className="py-2">
                  <TextLink href={`/candidates/${p.id}`}>
                    {p.firstName} {p.lastName}
                  </TextLink>
                  <p className="text-xs text-slate-500">
                    {p.jobTitle ?? PERSON_TYPE_LABELS[p.type]} · {p.email}
                  </p>
                </li>
              ))}
              {people.length === 0 && <li className="py-2 text-slate-400">No people linked.</li>}
            </ul>
          </Card>
          <Card>
            <CardTitle>Portal logins</CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {logins.map((u) => (
                <li key={u.id} className="flex justify-between py-2">
                  <span className="text-slate-700">{u.email}</span>
                  <span className="text-xs text-slate-400">since {formatDate(u.createdAt)}</span>
                </li>
              ))}
              {logins.length === 0 && <li className="py-2 text-slate-400">Nobody has signed up for this company yet.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
