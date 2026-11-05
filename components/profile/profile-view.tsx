import { BadgeCheck, CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { LEVEL_LABELS, ROLE_LABELS, formatDate } from "@/lib/utils";

export interface ProfileViewData {
  displayName: string;
  headline: string | null;
  summary: string | null;
  primaryRole: string | null;
  yearsExperience: number | null;
  country: string | null;
  preferredTimezone: string | null;
  availableFrom: string | null;
  ctaVetted: boolean;
  skills: { name: string; level: string }[];
  certifications: string[];
  industries: string[];
  experience: {
    id: string;
    jobTitle: string;
    companyName?: string | null;
    startDate: string;
    endDate: string | null;
    industry: string | null;
    projectDescription: string | null;
  }[];
}

export function ProfileView({ data }: { data: ProfileViewData }) {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{data.displayName}</h2>
            {data.headline && <p className="mt-1 text-slate-300">{data.headline}</p>}
          </div>
          {data.ctaVetted && (
            <Badge tone="cyan" className="text-sm">
              <BadgeCheck size={14} /> CTA vetted
            </Badge>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
          {data.primaryRole && <span>{ROLE_LABELS[data.primaryRole]}</span>}
          {data.yearsExperience != null && <span>{data.yearsExperience} yrs experience</span>}
          {data.country && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {data.country}
            </span>
          )}
          {data.preferredTimezone && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {data.preferredTimezone}
            </span>
          )}
          {data.availableFrom && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> Available {formatDate(data.availableFrom)}
            </span>
          )}
        </div>
        {data.summary && <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-300">{data.summary}</p>}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 px-3 py-1 text-sm">
                {s.name} <span className="text-xs text-indigo-300">{LEVEL_LABELS[s.level]}</span>
              </span>
            ))}
          </div>
          {data.industries.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold text-white">Industries</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.industries.map((i) => (
                  <Badge key={i}>{i}</Badge>
                ))}
              </div>
            </>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold text-white">Certifications</h3>
          <ul className="mt-4 space-y-2">
            {data.certifications.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-slate-300">
                <BadgeCheck size={15} className="mt-0.5 shrink-0 text-brand-cyan" /> {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-white">Work experience</h3>
        <ol className="mt-4 space-y-5 border-l border-white/10 pl-5">
          {data.experience.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-indigo" />
              <p className="font-medium text-white">
                {e.jobTitle}
                {e.companyName && <span className="text-slate-400"> · {e.companyName}</span>}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(e.startDate)} – {e.endDate ? formatDate(e.endDate) : "Present"}
                {e.industry && ` · ${e.industry}`}
              </p>
              {e.projectDescription && <p className="mt-2 text-sm text-slate-300">{e.projectDescription}</p>}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
