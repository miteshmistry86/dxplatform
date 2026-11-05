import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { getDb, schema } from "@dx/db";
import { CandidateSummary } from "@/components/candidate-summary";
import { Badge, Button, ButtonLink, Card, CardTitle, Field, Input, PageHeader, Textarea, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getCandidate } from "@/lib/queries";
import { PROFILE_STATUS_LABELS, UUID_RE, formatDateTime } from "@/lib/utils";
import { recordScreeningDecision } from "../../../actions";

const OUTCOME_LABELS: Record<string, string> = {
  pending: "Screening started",
  call_scheduled: "Call booked",
  approved: "Approved",
  rejected: "Rejected",
};

export default async function ScreeningReviewPage({ params }: PageProps<"/screening/[id]">) {
  await requireOwner();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const db = getDb();
  const profile = await db.query.resourceProfiles.findFirst({ where: eq(schema.resourceProfiles.id, id) });
  if (!profile) notFound();

  const [candidate, reviews] = await Promise.all([
    getCandidate(profile.personId),
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
  if (!candidate) notFound();
  const { person } = candidate;

  return (
    <>
      <PageHeader
        back={{ href: "/screening", label: "Screening queue" }}
        title={`Review: ${person.firstName} ${person.lastName}`}
        actions={
          <ButtonLink href={`/candidates/${person.id}`} variant="secondary">
            Edit full record
          </ButtonLink>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <CandidateSummary candidate={candidate} />

        <div className="space-y-6">
          <Card>
            <CardTitle actions={<Badge tone={statusTone(profile.status)}>{PROFILE_STATUS_LABELS[profile.status]}</Badge>}>
              Contact
            </CardTitle>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <a href={`mailto:${person.email}`} className="hover:text-indigo-600">
                  {person.email}
                </a>
              </li>
              {person.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> {person.phone}
                </li>
              )}
              {person.linkedinUrl && (
                <li className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-slate-400" />
                  <a href={person.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600">
                    LinkedIn profile
                  </a>
                </li>
              )}
              {profile.dayRate && (
                <li className="text-slate-500">
                  Day rate: {profile.currency} {profile.dayRate}
                </li>
              )}
            </ul>
          </Card>

          <Card>
            <CardTitle>Decision</CardTitle>
            <form action={recordScreeningDecision} className="space-y-4">
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
                <Button type="submit" name="decision" value="approve" variant="success">
                  Approve &amp; list
                </Button>
                <Button type="submit" name="decision" value="reject" variant="danger">
                  Reject
                </Button>
              </div>
              <p className="text-xs text-slate-500">Approving lists the candidate to companies with a masked name and marks them CTA-vetted.</p>
            </form>
          </Card>

          <Card>
            <CardTitle>History</CardTitle>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400">No decisions recorded yet.</p>
            ) : (
              <ol className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <Badge tone={statusTone(r.outcome)}>{OUTCOME_LABELS[r.outcome]}</Badge>
                      <span className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>
                    </div>
                    {r.callScheduledAt && <p className="mt-1 text-xs text-slate-500">Call: {formatDateTime(r.callScheduledAt)}</p>}
                    {r.notes && <p className="mt-1 text-slate-700">{r.notes}</p>}
                    <p className="mt-1 text-xs text-slate-400">{r.reviewer ?? "Unknown reviewer"}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
