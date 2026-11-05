import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, Mail, Phone } from "lucide-react";
import { getDb, schema } from "@/db";
import { ProfileView } from "@/components/profile/profile-view";
import { Badge, Button, Card, Field, Input, Textarea, statusTone } from "@/components/ui";
import { getFullProfile } from "@/lib/queries";
import { STATUS_LABELS, formatDate } from "@/lib/utils";
import { recordScreeningDecision } from "../../actions";

export default async function ScreeningDetailPage({ params }: PageProps<"/admin/screening/[id]">) {
  await requireRole("admin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = getDb();
  const profile = await db.query.resourceProfiles.findFirst({ where: eq(schema.resourceProfiles.id, id) });
  if (!profile) notFound();

  const [full, reviews] = await Promise.all([
    getFullProfile(profile.personId),
    db
      .select({
        id: schema.screeningReviews.id,
        outcome: schema.screeningReviews.outcome,
        notes: schema.screeningReviews.notes,
        callScheduledAt: schema.screeningReviews.callScheduledAt,
        createdAt: schema.screeningReviews.createdAt,
        reviewer: schema.users.email,
      })
      .from(schema.screeningReviews)
      .leftJoin(schema.users, eq(schema.users.id, schema.screeningReviews.reviewerUserId))
      .where(eq(schema.screeningReviews.profileId, id))
      .orderBy(desc(schema.screeningReviews.createdAt)),
  ]);
  if (!full) notFound();
  const { person } = full;

  return (
    <>
      <Link href="/admin/screening" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Screening queue
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ProfileView
          data={{
            displayName: `${person.firstName} ${person.lastName}`,
            headline: profile.headline,
            summary: profile.summary,
            primaryRole: profile.primaryRole,
            yearsExperience: profile.yearsExperience,
            country: person.country,
            preferredTimezone: person.preferredTimezone,
            availableFrom: profile.availableFrom,
            ctaVetted: profile.ctaVetted,
            skills: full.skills,
            certifications: full.certifications.map((c) => c.name),
            industries: full.industries.map((i) => i.name),
            experience: full.experience,
          }}
        />

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Contact</h2>
              <Badge tone={statusTone(profile.status)}>{STATUS_LABELS[profile.status]}</Badge>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-500" />
                <a href={`mailto:${person.email}`} className="hover:text-white">
                  {person.email}
                </a>
              </li>
              {person.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-500" /> {person.phone}
                </li>
              )}
              {person.linkedinUrl && (
                <li className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-slate-500" />
                  <a href={person.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                    LinkedIn
                  </a>
                </li>
              )}
              {profile.dayRate && (
                <li className="text-slate-400">
                  Day rate: {profile.currency} {profile.dayRate}
                </li>
              )}
            </ul>
          </Card>

          <Card>
            <h2 className="font-semibold text-white">Screening decision</h2>
            <form action={recordScreeningDecision} className="mt-4 space-y-4">
              <input type="hidden" name="profile_id" value={profile.id} />
              <Field label="Notes">
                <Textarea name="notes" rows={4} placeholder="Technical assessment, strengths, concerns" />
              </Field>
              <Field label="Screening call (optional)">
                <Input name="call_scheduled_at" type="datetime-local" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Button type="submit" name="decision" value="start" variant="secondary">
                  Start screening
                </Button>
                <Button type="submit" name="decision" value="schedule" variant="secondary">
                  Log call booked
                </Button>
                <Button type="submit" name="decision" value="approve">
                  Approve & list
                </Button>
                <Button type="submit" name="decision" value="reject" variant="danger">
                  Reject
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="font-semibold text-white">History</h2>
            <ol className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <Badge tone={statusTone(r.outcome)}>{r.outcome.replace("_", " ")}</Badge>
                    <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.callScheduledAt && (
                    <p className="mt-1 text-xs text-slate-400">Call: {new Date(r.callScheduledAt).toLocaleString("en-GB")}</p>
                  )}
                  {r.notes && <p className="mt-1 text-slate-300">{r.notes}</p>}
                  <p className="mt-1 text-xs text-slate-500">{r.reviewer ?? "Submitted by developer"}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
