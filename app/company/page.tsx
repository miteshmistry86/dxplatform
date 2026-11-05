import { desc, eq } from "drizzle-orm";
import { ArrowRight, Search, Send, Workflow } from "lucide-react";
import { getDb, schema } from "@/db";
import { Badge, ButtonLink, Card, PageHeader, statusTone } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { ROLE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";

export default async function CompanyHome() {
  const user = await requireRole("company_user");
  const db = getDb();
  const [org, requests] = await Promise.all([
    db.query.organisations.findFirst({ where: eq(schema.organisations.id, user.organisationId!) }),
    db
      .select()
      .from(schema.resourceRequests)
      .where(eq(schema.resourceRequests.organisationId, user.organisationId!))
      .orderBy(desc(schema.resourceRequests.createdAt))
      .limit(5),
  ]);

  return (
    <>
      <PageHeader title={org?.name ?? "Your company"} description="Find vetted Salesforce talent or let us build the team for you." />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <Search className="text-brand-cyan" size={22} />
          <h2 className="mt-4 text-lg font-semibold text-white">Browse talent</h2>
          <p className="mt-1 text-sm text-slate-400">Search CTA-vetted profiles by skill, certification and industry.</p>
          <ButtonLink href="/company/talent" variant="secondary" className="mt-5">
            Browse <ArrowRight size={15} />
          </ButtonLink>
        </Card>
        <Card>
          <Send className="text-brand-indigo" size={22} />
          <h2 className="mt-4 text-lg font-semibold text-white">Submit a requirement</h2>
          <p className="mt-1 text-sm text-slate-400">Tell us the role and skills; our team will shortlist matches.</p>
          <ButtonLink href="/company/requests/new" variant="secondary" className="mt-5">
            New request <ArrowRight size={15} />
          </ButtonLink>
        </Card>
        <Card>
          <Workflow className="text-brand-violet" size={22} />
          <h2 className="mt-4 text-lg font-semibold text-white">AI-powered delivery</h2>
          <p className="mt-1 text-sm text-slate-400">Add the Salesforce Delivery Agent to accelerate your project.</p>
          <ButtonLink href="/agentic-sdlc" variant="secondary" className="mt-5">
            Learn more <ArrowRight size={15} />
          </ButtonLink>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-white">Recent requests</h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No requests yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-200">
                  {ROLE_LABELS[r.roleRequired]}
                  {r.targetPersonId && <span className="text-slate-500"> · specific resource</span>}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-500">{formatDate(r.createdAt)}</span>
                  <Badge tone={statusTone(r.status)}>{STATUS_LABELS[r.status]}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
