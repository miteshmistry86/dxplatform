import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Badge, Card, CardTitle, PageHeader, TextLink, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getOrganisationOptions, getReferenceData } from "@/lib/queries";
import { REQUEST_STATUS_LABELS, ROLE_LABELS, UUID_RE, formatDate } from "@/lib/utils";
import { ProjectForm } from "../project-form";

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  await requireOwner();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const db = getDb();
  const project = await db.query.projects.findFirst({ where: eq(schema.projects.id, id) });
  if (!project) notFound();

  const [companies, ref, industryLinks, requests, assignments] = await Promise.all([
    getOrganisationOptions(),
    getReferenceData(),
    db.select({ industryId: schema.projectIndustries.industryId }).from(schema.projectIndustries).where(eq(schema.projectIndustries.projectId, id)),
    db.select().from(schema.resourceRequests).where(eq(schema.resourceRequests.projectId, id)).orderBy(desc(schema.resourceRequests.createdAt)),
    db
      .select({
        id: schema.assignedResources.id,
        personId: schema.people.id,
        firstName: schema.people.firstName,
        lastName: schema.people.lastName,
        startDate: schema.assignedResources.startDate,
        endDate: schema.assignedResources.endDate,
      })
      .from(schema.assignedResources)
      .innerJoin(schema.people, eq(schema.people.id, schema.assignedResources.personId))
      .where(eq(schema.assignedResources.projectId, id)),
  ]);
  const company = companies.find((c) => c.id === project.organisationId);

  return (
    <>
      <PageHeader back={{ href: "/projects", label: "Projects" }} title={project.name} description={company?.name} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardTitle>Details</CardTitle>
          <ProjectForm
            key={project.updatedAt.toISOString()}
            companies={companies}
            industries={ref.industries}
            defaults={project}
            selectedIndustryIds={industryLinks.map((l) => l.industryId)}
          />
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle>Resource requests</CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <TextLink href={`/requests/${r.id}`}>{ROLE_LABELS[r.roleRequired]}</TextLink>
                  <Badge tone={statusTone(r.status)}>{REQUEST_STATUS_LABELS[r.status]}</Badge>
                </li>
              ))}
              {requests.length === 0 && <li className="py-2 text-slate-400">No requests linked to this project.</li>}
            </ul>
          </Card>
          <Card>
            <CardTitle>Assigned resources</CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {assignments.map((a) => (
                <li key={a.id} className="py-2">
                  <TextLink href={`/candidates/${a.personId}`}>
                    {a.firstName} {a.lastName}
                  </TextLink>
                  <p className="text-xs text-slate-500">
                    {formatDate(a.startDate)} – {formatDate(a.endDate)}
                  </p>
                </li>
              ))}
              {assignments.length === 0 && (
                <li className="py-2 text-slate-400">Nobody assigned yet. Assign someone from a resource request.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
