import type { Metadata } from "next";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Badge, DataTable, FilterTabs, PageHeader, TextLink, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { PROFILE_STATUS_LABELS, ROLE_LABELS, formatDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Screening queue" };

const QUEUE = ["submitted", "screening"] as const;

export default async function ScreeningPage({ searchParams }: PageProps<"/screening">) {
  await requireOwner();
  const { status } = await searchParams;
  const filter = QUEUE.find((s) => s === status);
  const { resourceProfiles: rp, people } = schema;

  const rows = await getDb()
    .select({
      id: rp.id,
      personId: people.id,
      status: rp.status,
      role: rp.primaryRole,
      years: rp.yearsExperience,
      submittedAt: rp.submittedAt,
      updatedAt: rp.updatedAt,
      firstName: people.firstName,
      lastName: people.lastName,
      email: people.email,
      country: people.country,
    })
    .from(rp)
    .innerJoin(people, eq(people.id, rp.personId))
    .where(inArray(rp.status, filter ? [filter] : [...QUEUE]))
    .orderBy(asc(rp.submittedAt));

  return (
    <>
      <PageHeader
        title="Screening queue"
        description="Candidates who have submitted a profile. Oldest first, so nobody waits too long."
      />
      <FilterTabs
        base="/screening"
        current={filter}
        options={[{ label: "All in queue" }, ...QUEUE.map((s) => ({ value: s, label: PROFILE_STATUS_LABELS[s] }))]}
      />
      <DataTable headers={["Candidate", "Role", "Experience", "Country", "Submitted", "Status", ""]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <p className="font-medium text-slate-900">
                {r.firstName} {r.lastName}
              </p>
              <p className="text-xs text-slate-500">{r.email}</p>
            </td>
            <td className="text-slate-600">{r.role ? ROLE_LABELS[r.role] : "—"}</td>
            <td className="text-slate-600">{r.years != null ? `${r.years} yrs` : "—"}</td>
            <td className="text-slate-600">{r.country ?? "—"}</td>
            <td className="text-slate-600" title={formatDate(r.submittedAt)}>
              {r.submittedAt ? timeAgo(r.submittedAt) : "—"}
            </td>
            <td>
              <Badge tone={statusTone(r.status)}>{PROFILE_STATUS_LABELS[r.status]}</Badge>
            </td>
            <td className="text-right">
              <TextLink href={`/screening/${r.id}`}>Review →</TextLink>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
