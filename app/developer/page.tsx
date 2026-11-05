import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { Badge, Button, ButtonLink, Card, Notice, PageHeader, statusTone } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getFullProfile, profileCompleteness } from "@/lib/queries";
import { STATUS_LABELS, formatDate } from "@/lib/utils";
import { submitForScreening } from "./actions";

const JOURNEY = ["draft", "submitted", "screening", "listed"] as const;

export default async function DeveloperHome() {
  const user = await requireRole("developer", "partner_admin");
  const full = await getFullProfile(user.personId!);
  if (!full?.profile) return <Notice tone="danger">Your profile could not be found.</Notice>;

  const { profile, person } = full;
  const { checks, complete } = profileCompleteness(full);
  const canSubmit = complete && (profile.status === "draft" || profile.status === "rejected");
  const step = JOURNEY.indexOf(profile.status as (typeof JOURNEY)[number]);

  return (
    <>
      <PageHeader
        title={`Welcome, ${person.firstName}`}
        description="Complete your profile and submit it for CTA screening to get listed."
        actions={<Badge tone={statusTone(profile.status)}>{STATUS_LABELS[profile.status]}</Badge>}
      />

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {JOURNEY.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span
                className={
                  i <= step
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-ink-950"
                    : "flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-slate-500"
                }
              >
                {i + 1}
              </span>
              <span className={i <= step ? "text-sm text-white" : "text-sm text-slate-500"}>{STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
        {profile.status === "rejected" && (
          <div className="mt-5">
            <Notice tone="danger">
              Your profile wasn&apos;t approved this time. Update your profile and resubmit, or contact us for feedback.
            </Notice>
          </div>
        )}
        {profile.status === "listed" && (
          <div className="mt-5">
            <Notice tone="success">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} /> You&apos;re listed and visible to clients as &ldquo;{person.firstName}{" "}
                {person.lastName.charAt(0)}.&rdquo; since {formatDate(profile.listedAt)}.
              </span>
            </Notice>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Profile checklist</h2>
          <ul className="mt-4 space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                {c.done ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <Circle size={18} className="text-slate-600" />
                )}
                <span className={c.done ? "text-slate-200" : "text-slate-400"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/developer/profile" variant="secondary" className="mt-6">
            Edit profile
          </ButtonLink>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Submit for screening</h2>
          <p className="mt-2 text-sm text-slate-400">
            Once submitted, a member of our team, led by a Salesforce CTA, will review your profile and may book a
            short technical call before listing you.
          </p>
          <form action={submitForScreening} className="mt-6">
            <Button type="submit" disabled={!canSubmit} className="w-full">
              {profile.status === "rejected" ? "Resubmit for screening" : "Submit for screening"}
            </Button>
          </form>
          {!complete && <p className="mt-3 text-xs text-slate-500">Complete the checklist to submit.</p>}
          {profile.submittedAt && (
            <p className="mt-3 text-xs text-slate-500">Last submitted {formatDate(profile.submittedAt)}</p>
          )}
        </Card>
      </div>
    </>
  );
}
