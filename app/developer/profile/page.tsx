import type { Metadata } from "next";
import { X } from "lucide-react";
import { DetailsForm } from "@/components/profile/details-form";
import { ExperienceForm } from "@/components/profile/experience-form";
import { Badge, Button, Card, Field, Input, PageHeader, Select } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getFullProfile, getReferenceData } from "@/lib/queries";
import { LEVEL_LABELS, formatDate } from "@/lib/utils";
import {
  addCertification,
  addExperience,
  addSkill,
  removeCertification,
  removeExperience,
  removeSkill,
  saveProfileDetails,
} from "../actions";

export const metadata: Metadata = { title: "My profile" };

function RemoveButton({ id, action }: { id: string; action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="rounded-md p-1 text-slate-500 hover:bg-white/5 hover:text-rose-300" aria-label="Remove">
        <X size={14} />
      </button>
    </form>
  );
}

export default async function DeveloperProfilePage() {
  const user = await requireRole("developer", "partner_admin");
  const [full, ref] = await Promise.all([getFullProfile(user.personId!), getReferenceData()]);
  if (!full?.profile) return null;
  const { person, profile } = full;

  const ownedSkills = new Set(full.skills.map((s) => s.name));
  const ownedCerts = new Set(full.certifications.map((c) => c.name));

  return (
    <>
      <PageHeader
        title="My profile"
        description="This is what our team screens and what clients see once you're listed (with your surname masked)."
      />

      <div className="space-y-6">
        <Card>
          <h2 className="mb-6 text-lg font-semibold text-white">Personal & professional details</h2>
          <DetailsForm
            action={saveProfileDetails}
            industries={ref.industries}
            defaults={{
              firstName: person.firstName,
              lastName: person.lastName,
              jobTitle: person.jobTitle,
              phone: person.phone,
              country: person.country,
              preferredTimezone: person.preferredTimezone,
              linkedinUrl: person.linkedinUrl,
              dateOfBirth: person.dateOfBirth,
              headline: profile.headline,
              summary: profile.summary,
              primaryRole: profile.primaryRole,
              yearsExperience: profile.yearsExperience,
              dayRate: profile.dayRate,
              currency: profile.currency,
              availableFrom: profile.availableFrom,
              industryIds: full.industries.map((i) => i.id),
            }}
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Skills</h2>
          <p className="mt-1 text-sm text-slate-400">Add the skills you want to be found for, with your proficiency.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {full.skills.length === 0 && <p className="text-sm text-slate-500">No skills added yet.</p>}
            {full.skills.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 py-1 pl-3 pr-1 text-sm"
              >
                {s.name}
                <Badge tone="brand">{LEVEL_LABELS[s.level]}</Badge>
                <RemoveButton id={s.id} action={removeSkill} />
              </span>
            ))}
          </div>
          <form action={addSkill} className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <Field label="Skill">
              <Select name="skill_id" required defaultValue="">
                <option value="" disabled>
                  Select a skill…
                </option>
                {ref.skills
                  .filter((s) => !ownedSkills.has(s.name))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Level">
              <Select name="level" defaultValue="middle">
                {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" variant="secondary">
              Add skill
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Certifications</h2>
          <ul className="mt-4 divide-y divide-white/5">
            {full.certifications.length === 0 && <p className="text-sm text-slate-500">No certifications added yet.</p>}
            {full.certifications.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="text-slate-200">{c.name}</span>
                <span className="flex items-center gap-3 text-slate-500">
                  {c.achievedOn && formatDate(c.achievedOn)}
                  <RemoveButton id={c.id} action={removeCertification} />
                </span>
              </li>
            ))}
          </ul>
          <form action={addCertification} className="mt-6 grid gap-3 sm:grid-cols-[1fr_170px_1fr_auto] sm:items-end">
            <Field label="Certification">
              <Select name="certification_id" required defaultValue="">
                <option value="" disabled>
                  Select a certification…
                </option>
                {ref.certifications
                  .filter((c) => !ownedCerts.has(c.name))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Achieved on">
              <Input name="achieved_on" type="date" />
            </Field>
            <Field label="Credential URL">
              <Input name="credential_url" type="url" placeholder="Trailhead / Credly link" />
            </Field>
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Work experience</h2>
          <ul className="mt-4 space-y-3">
            {full.experience.length === 0 && <p className="text-sm text-slate-500">No experience added yet.</p>}
            {full.experience.map((e) => (
              <li key={e.id} className="flex justify-between gap-4 rounded-xl border border-white/5 bg-ink-800/50 p-4">
                <div>
                  <p className="font-medium text-white">
                    {e.jobTitle}
                    {e.companyName && <span className="text-slate-400"> · {e.companyName}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(e.startDate)} – {e.endDate ? formatDate(e.endDate) : "Present"}
                    {e.industry && ` · ${e.industry}`}
                  </p>
                  {e.projectDescription && <p className="mt-2 text-sm text-slate-300">{e.projectDescription}</p>}
                </div>
                <RemoveButton id={e.id} action={removeExperience} />
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-white/5 pt-6">
            <ExperienceForm industries={ref.industries} action={addExperience} />
          </div>
        </Card>
      </div>
    </>
  );
}
