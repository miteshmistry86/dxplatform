import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { RemoveButton } from "@/components/remove-button";
import { Badge, Button, ButtonLink, Card, CardTitle, Input, PageHeader, Select, TextLink, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getCandidate, getOrganisationOptions, getReferenceData } from "@/lib/queries";
import { LEVEL_LABELS, PROFILE_STATUS_LABELS, ROLE_LABELS, SHORTLIST_LABELS, UUID_RE, formatDate } from "@/lib/utils";
import { addCertification, addSkill, createResourceProfile, removeCertification, removeExperience, removeSkill } from "../../../actions";
import { ExperienceForm } from "./experience-form";
import { PersonForm } from "./person-form";

export default async function CandidatePage({ params }: PageProps<"/candidates/[id]">) {
  await requireOwner();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const db = getDb();
  const [candidate, ref, organisations, shortlists] = await Promise.all([
    getCandidate(id),
    getReferenceData(),
    getOrganisationOptions(),
    db
      .select({
        id: schema.shortlistedResources.id,
        status: schema.shortlistedResources.status,
        requestId: schema.resourceRequests.id,
        role: schema.resourceRequests.roleRequired,
        company: schema.organisations.name,
        at: schema.shortlistedResources.createdAt,
      })
      .from(schema.shortlistedResources)
      .innerJoin(schema.resourceRequests, eq(schema.resourceRequests.id, schema.shortlistedResources.resourceRequestId))
      .innerJoin(schema.organisations, eq(schema.organisations.id, schema.resourceRequests.organisationId))
      .where(eq(schema.shortlistedResources.personId, id))
      .orderBy(desc(schema.shortlistedResources.createdAt)),
  ]);
  if (!candidate) notFound();
  const { person, profile } = candidate;
  const ownedSkills = new Set(candidate.skills.map((s) => s.name));
  const ownedCerts = new Set(candidate.certifications.map((c) => c.name));

  return (
    <>
      <PageHeader
        back={{ href: "/candidates", label: "Candidates" }}
        title={`${person.firstName} ${person.lastName}`}
        description={profile?.headline ?? person.email}
        actions={
          profile && (
            <>
              <Badge tone={statusTone(profile.status)} className="self-center px-2.5 py-1">
                {PROFILE_STATUS_LABELS[profile.status]}
              </Badge>
              <ButtonLink href={`/screening/${profile.id}`} variant="secondary">
                Screening review
              </ButtonLink>
            </>
          )
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle>Record</CardTitle>
          <PersonForm
            key={`${person.updatedAt.toISOString()}-${profile?.updatedAt.toISOString()}`}
            organisations={organisations}
            industries={ref.industries}
            defaults={{
              ...person,
              industryIds: candidate.industries.map((i) => i.id),
              profile: profile
                ? {
                    headline: profile.headline,
                    summary: profile.summary,
                    primaryRole: profile.primaryRole,
                    yearsExperience: profile.yearsExperience,
                    dayRate: profile.dayRate,
                    currency: profile.currency,
                    availableFrom: profile.availableFrom,
                    openToRemote: profile.openToRemote,
                  }
                : null,
            }}
          />
          {!profile && (
            <form action={createResourceProfile} className="mt-6 rounded-lg border border-dashed border-slate-300 p-4">
              <input type="hidden" name="person_id" value={person.id} />
              <p className="mb-3 text-sm text-slate-600">
                No resource profile yet, so there is no headline, skills or experience and nothing is listed to companies.
              </p>
              <Button type="submit" variant="secondary">
                Create resource profile
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-6">
          {profile && (
            <>
              <Card>
                <CardTitle>Skills</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.length === 0 && <p className="text-sm text-slate-400">No skills yet.</p>}
                  {candidate.skills.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 py-0.5 pl-2.5 pr-0.5 text-sm">
                      {s.name}
                      <span className="text-xs text-slate-400">{LEVEL_LABELS[s.level]}</span>
                      <RemoveButton id={s.id} personId={person.id} action={removeSkill} />
                    </span>
                  ))}
                </div>
                <form action={addSkill} className="mt-4 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                  <input type="hidden" name="person_id" value={person.id} />
                  <Select name="skill_id" required defaultValue="">
                    <option value="" disabled>
                      Add a skill…
                    </option>
                    {ref.skills
                      .filter((s) => !ownedSkills.has(s.name))
                      .map((s) => (
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
                <CardTitle>Certifications</CardTitle>
                <ul className="divide-y divide-slate-100">
                  {candidate.certifications.length === 0 && <li className="text-sm text-slate-400">None yet.</li>}
                  {candidate.certifications.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="text-slate-700">{c.name}</span>
                      <span className="flex items-center gap-2 text-xs text-slate-400">
                        {c.achievedOn && formatDate(c.achievedOn)}
                        <RemoveButton id={c.id} personId={person.id} action={removeCertification} />
                      </span>
                    </li>
                  ))}
                </ul>
                <form action={addCertification} className="mt-4 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                  <input type="hidden" name="person_id" value={person.id} />
                  <Select name="certification_id" required defaultValue="">
                    <option value="" disabled>
                      Add a certification…
                    </option>
                    {ref.certifications
                      .filter((c) => !ownedCerts.has(c.name))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </Select>
                  <Input name="achieved_on" type="date" aria-label="Achieved on" />
                  <Button type="submit" variant="secondary">
                    Add
                  </Button>
                </form>
              </Card>

              <Card>
                <CardTitle>Work experience</CardTitle>
                <ul className="space-y-3">
                  {candidate.experience.map((e) => (
                    <li key={e.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {e.jobTitle}
                          {e.companyName && <span className="font-normal text-slate-500"> · {e.companyName}</span>}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(e.startDate)} – {e.endDate ? formatDate(e.endDate) : "Present"}
                          {e.industry && ` · ${e.industry}`}
                        </p>
                        {e.projectDescription && <p className="mt-1 text-sm text-slate-600">{e.projectDescription}</p>}
                      </div>
                      <RemoveButton id={e.id} personId={person.id} action={removeExperience} />
                    </li>
                  ))}
                </ul>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-indigo-600">Add experience</summary>
                  <div className="mt-4">
                    <ExperienceForm personId={person.id} industries={ref.industries} />
                  </div>
                </details>
              </Card>
            </>
          )}

          <Card>
            <CardTitle>Shortlisted for</CardTitle>
            {shortlists.length === 0 ? (
              <p className="text-sm text-slate-400">Not shortlisted for any request.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {shortlists.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                    <TextLink href={`/requests/${s.requestId}`}>
                      {s.company} · {ROLE_LABELS[s.role]}
                    </TextLink>
                    <Badge tone={statusTone(s.status)}>{SHORTLIST_LABELS[s.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
