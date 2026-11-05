import { Badge, Card, CardTitle } from "@/components/ui";
import type { Candidate } from "@/lib/queries";
import { LEVEL_LABELS, ROLE_LABELS, formatDate } from "@/lib/utils";

export function CandidateSummary({ candidate }: { candidate: Candidate }) {
  const { person, profile } = candidate;
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">
          {person.firstName} {person.lastName}
        </h2>
        {profile?.headline && <p className="mt-1 text-slate-600">{profile.headline}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {profile?.primaryRole && <Badge tone="brand">{ROLE_LABELS[profile.primaryRole]}</Badge>}
          {profile?.yearsExperience != null && <Badge>{profile.yearsExperience} yrs Salesforce</Badge>}
          {person.country && <Badge>{person.country}</Badge>}
          {person.preferredTimezone && <Badge>{person.preferredTimezone}</Badge>}
          {profile?.availableFrom && <Badge tone="success">Available {formatDate(profile.availableFrom)}</Badge>}
          {profile?.openToRemote && <Badge>Remote OK</Badge>}
        </div>
        {profile?.summary && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{profile.summary}</p>}
      </Card>

      <Card>
        <CardTitle>Skills</CardTitle>
        {candidate.skills.length === 0 ? (
          <p className="text-sm text-slate-400">No skills added.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s) => (
              <Badge key={s.id} tone="neutral" className="py-1">
                {s.name} <span className="text-slate-400">· {LEVEL_LABELS[s.level]}</span>
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Certifications</CardTitle>
          {candidate.certifications.length === 0 ? (
            <p className="text-sm text-slate-400">None listed.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-slate-700">
              {candidate.certifications.map((c) => (
                <li key={c.id} className="flex justify-between gap-3">
                  <span>{c.name}</span>
                  <span className="text-slate-400">{c.achievedOn ? formatDate(c.achievedOn) : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle>Industries</CardTitle>
          {candidate.industries.length === 0 ? (
            <p className="text-sm text-slate-400">None listed.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {candidate.industries.map((i) => (
                <Badge key={i.id}>{i.name}</Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>Work experience</CardTitle>
        {candidate.experience.length === 0 ? (
          <p className="text-sm text-slate-400">No experience added.</p>
        ) : (
          <ol className="space-y-4">
            {candidate.experience.map((e) => (
              <li key={e.id} className="border-l-2 border-indigo-200 pl-4">
                <p className="font-medium text-slate-900">
                  {e.jobTitle}
                  {e.companyName && <span className="font-normal text-slate-500"> · {e.companyName}</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(e.startDate)} – {e.endDate ? formatDate(e.endDate) : "Present"}
                  {e.industry && ` · ${e.industry}`}
                </p>
                {e.projectDescription && <p className="mt-1.5 text-sm text-slate-700">{e.projectDescription}</p>}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
