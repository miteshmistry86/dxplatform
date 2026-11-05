import type { Metadata } from "next";
import { and, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Badge, DataTable, FilterTabs, PageHeader, StatusSelect, TextLink, statusTone } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { PERSON_TYPE_LABELS, PROFILE_STATUS_LABELS, ROLE_LABELS, formatDate } from "@/lib/utils";
import { setProfileStatus } from "../../actions";

export const metadata: Metadata = { title: "Candidates" };

const STATUSES = schema.profileStatus.enumValues;

export default async function CandidatesPage({ searchParams }: PageProps<"/candidates">) {
  await requireOwner();
  const { status, q } = await searchParams;
  const filter = STATUSES.find((s) => s === status);
  const query = typeof q === "string" ? q.trim() : "";
  const { resourceProfiles: rp, people } = schema;
  const db = getDb();

  const conditions: (SQL | undefined)[] = [ne(people.type, "client_contact")];
  if (filter) conditions.push(eq(rp.status, filter));
  if (query) {
    const like = `%${query}%`;
    conditions.push(or(ilike(people.firstName, like), ilike(people.lastName, like), ilike(people.email, like), ilike(rp.headline, like)));
  }

  const [rows, counts] = await Promise.all([
    db
      .select({
        personId: people.id,
        profileId: rp.id,
        status: rp.status,
        role: rp.primaryRole,
        headline: rp.headline,
        firstName: people.firstName,
        lastName: people.lastName,
        email: people.email,
        type: people.type,
        country: people.country,
        updatedAt: people.updatedAt,
      })
      .from(people)
      .leftJoin(rp, eq(rp.personId, people.id))
      .where(and(...conditions))
      .orderBy(desc(people.updatedAt))
      .limit(500),
    db.select({ status: rp.status, n: count() }).from(rp).groupBy(rp.status),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <>
      <PageHeader title="Candidates" description="Every developer and partner resource, with the full unmasked record." />
      <form className="mb-4 flex max-w-md gap-2">
        {filter && <input type="hidden" name="status" value={filter} />}
        <input
          name="q"
          defaultValue={query}
          placeholder="Filter by name, email or headline"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500"
        />
      </form>
      <FilterTabs
        base="/candidates"
        current={filter}
        extra={{ q: query || undefined }}
        options={[{ label: "All" }, ...STATUSES.map((s) => ({ value: s, label: PROFILE_STATUS_LABELS[s], count: countFor(s) }))]}
      />
      <DataTable headers={["Name", "Role", "Type", "Country", "Updated", "Profile status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.personId}>
            <td>
              <TextLink href={`/candidates/${r.personId}`}>
                {r.firstName} {r.lastName}
              </TextLink>
              <p className="text-xs text-slate-500">{r.email}</p>
            </td>
            <td className="text-slate-600">
              {r.role ? ROLE_LABELS[r.role] : "—"}
              {r.headline && <p className="max-w-xs truncate text-xs text-slate-400">{r.headline}</p>}
            </td>
            <td className="text-slate-600">{PERSON_TYPE_LABELS[r.type]}</td>
            <td className="text-slate-600">{r.country ?? "—"}</td>
            <td className="text-slate-600">{formatDate(r.updatedAt)}</td>
            <td>
              {r.profileId && r.status ? (
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(r.status)}>{PROFILE_STATUS_LABELS[r.status]}</Badge>
                  <StatusSelect id={r.profileId} value={r.status} action={setProfileStatus} options={PROFILE_STATUS_LABELS} />
                </div>
              ) : (
                <span className="text-xs text-slate-400">No profile</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
