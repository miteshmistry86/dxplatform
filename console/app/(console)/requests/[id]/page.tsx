import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { RemoveButton } from "@/components/remove-button";
import { Badge, Button, Card, CardTitle, Field, Input, Notice, PageHeader, Select, TextLink, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getReferenceData } from "@/lib/queries";
import { LEVEL_LABELS, PROFILE_STATUS_LABELS, REQUEST_STATUS_LABELS, ROLE_LABELS, SHORTLIST_LABELS, UUID_RE, formatDate, formatDateTime } from "@/lib/utils";
import { addShortlist, addSkillRequirement, assignResource, removeSkillRequirement, setShortlistStatus } from "../../../actions";
import { RequestForm } from "./request-form";

export default async function RequestPage({ params }: PageProps<"/requests/[id]">) {
  await requireOwner();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const db = getDb();
  const request = await db.query.resourceRequests.findFirst({ where: eq(schema.resourceRequests.id, id) });
  if (!request) notFound();

  const [company, requester, target, projects, ref, skills, shortlist, candidates] = await Promise.all([
    db.query.organisations.findFirst({ where: eq(schema.organisations.id, request.organisationId) }),
    request.requestedByUserId
      ? db.query.users.findFirst({ where: eq(schema.users.id, request.requestedByUserId) })
      : undefined,
    request.targetPersonId ? db.query.people.findFirst({ where: eq(schema.people.id, request.targetPersonId) }) : undefined,
    db
      .select({ id: schema.projects.id, name: schema.projects.name })
      .from(schema.projects)
      .where(eq(schema.projects.organisationId, request.organisationId))
      .orderBy(asc(schema.projects.name)),
    getReferenceData(),
    db
      .select({ id: schema.skillRequirements.id, name: schema.skills.name, level: schema.skillRequirements.level })
      .from(schema.skillRequirements)
      .innerJoin(schema.skills, eq(schema.skills.id, schema.skillRequirements.skillId))
      .where(eq(schema.skillRequirements.resourceRequestId, id)),
    db
      .select({
        id: schema.shortlistedResources.id,
        personId: schema.people.id,
        firstName: schema.people.firstName,
        lastName: schema.people.lastName,
        status: schema.shortlistedResources.status,
        description: schema.shortlistedResources.description,
      })
      .from(schema.shortlistedResources)
      .innerJoin(schema.people, eq(schema.people.id, schema.shortlistedResources.personId))
      .where(eq(schema.shortlistedResources.resourceRequestId, id))
      .orderBy(desc(schema.shortlistedResources.createdAt)),
    db
      .select({
        id: schema.people.id,
        firstName: schema.people.firstName,
        lastName: schema.people.lastName,
        status: schema.resourceProfiles.status,
        role: schema.resourceProfiles.primaryRole,
      })
      .from(schema.resourceProfiles)
      .innerJoin(schema.people, eq(schema.people.id, schema.resourceProfiles.personId))
      .orderBy(asc(schema.people.lastName))
      .limit(500),
  ]);

  const shortlistedIds = new Set(shortlist.map((s) => s.personId));
  const available = candidates.filter((c) => !shortlistedIds.has(c.id));
  const listed = available.filter((c) => c.status === "listed");
  const other = available.filter((c) => c.status !== "listed");

  return (
    <>
      <PageHeader
        back={{ href: "/requests", label: "Resource requests" }}
        title={`${ROLE_LABELS[request.roleRequired]} for ${company?.name ?? "unknown company"}`}
        description={`Raised ${formatDateTime(request.createdAt)}${requester ? ` by ${requester.email}` : ""}`}
        actions={
          <Badge tone={statusTone(request.status)} className="self-center px-2.5 py-1">
            {REQUEST_STATUS_LABELS[request.status]}
          </Badge>
        }
      />

      {target && (
        <div className="mb-6">
          <Notice>
            The company asked for a specific person:{" "}
            <TextLink href={`/candidates/${target.id}`}>
              {target.firstName} {target.lastName}
            </TextLink>
          </Notice>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Requirement</CardTitle>
          <RequestForm key={request.updatedAt.toISOString()} request={request} projects={projects} />
          {company && (
            <p className="mt-4 text-sm text-slate-500">
              Company record: <TextLink href={`/companies/${company.id}`}>{company.name}</TextLink>
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Skills required</CardTitle>
            <ul className="divide-y divide-slate-100 text-sm">
              {skills.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-1.5">
                  <span className="text-slate-700">
                    {s.name} <span className="text-slate-400">· {LEVEL_LABELS[s.level]}</span>
                  </span>
                  <RemoveButton id={s.id} action={removeSkillRequirement} />
                </li>
              ))}
              {skills.length === 0 && <li className="py-1.5 text-slate-400">None specified.</li>}
            </ul>
            <form action={addSkillRequirement} className="mt-4 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <input type="hidden" name="resource_request_id" value={request.id} />
              <Select name="skill_id" required defaultValue="">
                <option value="" disabled>
                  Add a skill…
                </option>
                {ref.skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Select name="level" defaultValue="middle">
                {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                Add
              </Button>
            </form>
          </Card>

          <Card>
            <CardTitle>Shortlist</CardTitle>
            <ul className="space-y-2">
              {shortlist.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="min-w-0">
                    <TextLink href={`/candidates/${s.personId}`}>
                      {s.firstName} {s.lastName}
                    </TextLink>
                    {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={setShortlistStatus} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={s.id} />
                      <Select name="status" defaultValue={s.status} className="w-32 py-1 text-xs">
                        {Object.entries(SHORTLIST_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" variant="secondary" className="px-2.5 py-1 text-xs">
                        Set
                      </Button>
                    </form>
                    {s.status === "selected" ? (
                      <Badge tone="success">Selected</Badge>
                    ) : (
                      <form action={assignResource}>
                        <input type="hidden" name="person_id" value={s.personId} />
                        <input type="hidden" name="project_id" value={request.projectId ?? ""} />
                        <input type="hidden" name="resource_request_id" value={request.id} />
                        <input type="hidden" name="shortlist_id" value={s.id} />
                        <input type="hidden" name="start_date" value={request.startDate ?? ""} />
                        <input type="hidden" name="end_date" value={request.endDate ?? ""} />
                        <Button type="submit" variant="success" className="px-2.5 py-1 text-xs">
                          Assign
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
              {shortlist.length === 0 && <li className="text-sm text-slate-400">Nobody shortlisted yet.</li>}
            </ul>
            <form action={addShortlist} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <input type="hidden" name="resource_request_id" value={request.id} />
              <input type="hidden" name="project_id" value={request.projectId ?? ""} />
              <Field label="Add a candidate">
                <Select name="person_id" required defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  <optgroup label="Listed">
                    {listed.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                        {c.role ? ` · ${ROLE_LABELS[c.role]}` : ""}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Not yet listed">
                    {other.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({PROFILE_STATUS_LABELS[c.status]})
                      </option>
                    ))}
                  </optgroup>
                </Select>
              </Field>
              <Field label="Note">
                <Input name="description" placeholder="Why they fit" />
              </Field>
              <Button type="submit" variant="secondary">
                Shortlist
              </Button>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              Assigning marks the shortlist entry as selected and the request as fulfilled, using the request dates (
              {formatDate(request.startDate)} – {formatDate(request.endDate)}).
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
