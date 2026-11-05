import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { desc, eq, ilike, or } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Badge, Card, CardTitle, Empty, PageHeader, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { CONTACT_STATUS_LABELS, ORG_TYPE_LABELS, PERSON_TYPE_LABELS, REQUEST_STATUS_LABELS, ROLE_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "Search" };

function Section({ title, children, empty }: { title: string; children: ReactNode; empty: boolean }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {empty ? <Empty>No matches.</Empty> : <ul className="-mx-2 divide-y divide-slate-100">{children}</ul>}
    </Card>
  );
}

function Row({ href, title, detail, badge }: { href: string; title: string; detail?: string | null; badge?: ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{title}</p>
          {detail && <p className="truncate text-sm text-slate-500">{detail}</p>}
        </div>
        {badge}
      </Link>
    </li>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  await requireOwner();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";

  if (!query) {
    return (
      <>
        <PageHeader title="Search" description="Search across candidates, companies, requests and enquiries." />
        <Card>
          <Empty>Type in the search box above to get started.</Empty>
        </Card>
      </>
    );
  }

  const like = `%${query}%`;
  const db = getDb();
  const [people, companies, requests, contacts] = await Promise.all([
    db
      .select({ id: schema.people.id, firstName: schema.people.firstName, lastName: schema.people.lastName, email: schema.people.email, type: schema.people.type })
      .from(schema.people)
      .where(or(ilike(schema.people.firstName, like), ilike(schema.people.lastName, like), ilike(schema.people.email, like)))
      .limit(20),
    db
      .select({ id: schema.organisations.id, name: schema.organisations.name, type: schema.organisations.type, email: schema.organisations.companyEmail })
      .from(schema.organisations)
      .where(or(ilike(schema.organisations.name, like), ilike(schema.organisations.companyEmail, like)))
      .limit(20),
    db
      .select({ id: schema.resourceRequests.id, role: schema.resourceRequests.roleRequired, status: schema.resourceRequests.status, company: schema.organisations.name, description: schema.resourceRequests.description })
      .from(schema.resourceRequests)
      .innerJoin(schema.organisations, eq(schema.organisations.id, schema.resourceRequests.organisationId))
      .where(or(ilike(schema.organisations.name, like), ilike(schema.resourceRequests.description, like)))
      .orderBy(desc(schema.resourceRequests.createdAt))
      .limit(20),
    db
      .select()
      .from(schema.contactRequests)
      .where(
        or(
          ilike(schema.contactRequests.name, like),
          ilike(schema.contactRequests.email, like),
          ilike(schema.contactRequests.company, like),
          ilike(schema.contactRequests.message, like),
        ),
      )
      .orderBy(desc(schema.contactRequests.createdAt))
      .limit(20),
  ]);

  return (
    <>
      <PageHeader title={`Results for "${query}"`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={`People (${people.length})`} empty={people.length === 0}>
          {people.map((p) => (
            <Row
              key={p.id}
              href={`/candidates/${p.id}`}
              title={`${p.firstName} ${p.lastName}`}
              detail={p.email}
              badge={<Badge>{PERSON_TYPE_LABELS[p.type]}</Badge>}
            />
          ))}
        </Section>
        <Section title={`Companies (${companies.length})`} empty={companies.length === 0}>
          {companies.map((c) => (
            <Row key={c.id} href={`/companies/${c.id}`} title={c.name} detail={c.email} badge={<Badge>{ORG_TYPE_LABELS[c.type]}</Badge>} />
          ))}
        </Section>
        <Section title={`Resource requests (${requests.length})`} empty={requests.length === 0}>
          {requests.map((r) => (
            <Row
              key={r.id}
              href={`/requests/${r.id}`}
              title={`${ROLE_LABELS[r.role]} · ${r.company}`}
              detail={r.description}
              badge={<Badge tone={statusTone(r.status)}>{REQUEST_STATUS_LABELS[r.status]}</Badge>}
            />
          ))}
        </Section>
        <Section title={`Enquiries (${contacts.length})`} empty={contacts.length === 0}>
          {contacts.map((c) => (
            <Row
              key={c.id}
              href={`/contacts?open=${c.id}`}
              title={c.company ? `${c.name} · ${c.company}` : c.name}
              detail={c.message}
              badge={<Badge tone={statusTone(c.status)}>{CONTACT_STATUS_LABELS[c.status]}</Badge>}
            />
          ))}
        </Section>
      </div>
    </>
  );
}
