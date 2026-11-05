import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { Badge, Button, ButtonLink, Card, Input, PageHeader, Select } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getReferenceData, searchTalent } from "@/lib/queries";
import { LEVEL_LABELS, ROLE_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "Browse talent" };

function param(v: string | string[] | undefined) {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export default async function TalentSearchPage({ searchParams }: PageProps<"/company/talent">) {
  await requireRole("company_user");
  const sp = await searchParams;
  const filters = {
    q: param(sp.q),
    skill: param(sp.skill),
    role: param(sp.role),
    certification: param(sp.certification),
    industry: param(sp.industry),
  };
  const [results, ref] = await Promise.all([searchTalent(filters), getReferenceData()]);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader
        title="Browse talent"
        description="Every profile below has been technically screened by a Salesforce CTA."
        actions={
          <ButtonLink href="/company/requests/new" variant="secondary">
            Can&apos;t find a match? Submit a request
          </ButtonLink>
        }
      />

      <Card className="mb-6">
        <form className="grid gap-3 md:grid-cols-[2fr_repeat(4,1fr)_auto]">
          <Input name="q" placeholder="e.g. Revenue Cloud architect insurance" defaultValue={filters.q} />
          <Select name="skill" defaultValue={filters.skill ?? ""}>
            <option value="">Any skill</option>
            {ref.skills.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select name="role" defaultValue={filters.role ?? ""}>
            <option value="">Any role</option>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <Select name="certification" defaultValue={filters.certification ?? ""}>
            <option value="">Any certification</option>
            {ref.certifications.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select name="industry" defaultValue={filters.industry ?? ""}>
            <option value="">Any industry</option>
            {ref.industries.map((i) => (
              <option key={i.id} value={i.name}>
                {i.name}
              </option>
            ))}
          </Select>
          <Button type="submit">Search</Button>
        </form>
        {hasFilters && (
          <Link href="/company/talent" className="mt-3 inline-block text-xs text-indigo-300 hover:text-white">
            Clear filters
          </Link>
        )}
      </Card>

      <p className="mb-4 text-sm text-slate-400">
        {results.length} {results.length === 1 ? "profile" : "profiles"}
      </p>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {results.map((t) => (
          <Link key={t.id} href={`/company/talent/${t.id}`} className="group">
            <Card className="h-full transition group-hover:border-brand-indigo/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{t.displayName}</h3>
                  <p className="text-sm text-slate-400">
                    {t.primaryRole ? ROLE_LABELS[t.primaryRole] : t.jobTitle}
                    {t.yearsExperience != null && ` · ${t.yearsExperience} yrs`}
                  </p>
                </div>
                {t.ctaVetted && (
                  <Badge tone="cyan">
                    <BadgeCheck size={12} /> Vetted
                  </Badge>
                )}
              </div>
              {t.headline && <p className="mt-3 line-clamp-2 text-sm text-slate-300">{t.headline}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.skills.slice(0, 5).map((s) => (
                  <Badge key={s.name} tone={s.level === "expert" ? "brand" : "neutral"}>
                    {s.name}
                    <span className="opacity-60">· {LEVEL_LABELS[s.level]}</span>
                  </Badge>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                {t.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {t.country}
                  </span>
                )}
                <span>{t.certifications.length} certifications</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <Card className="text-center">
          <p className="text-slate-300">No profiles match those filters yet.</p>
          <p className="mt-1 text-sm text-slate-500">Submit a request and our team will source the right person.</p>
          <ButtonLink href="/company/requests/new" className="mt-5">
            Submit a request
          </ButtonLink>
        </Card>
      )}
    </>
  );
}
