import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@dx/db";
import { Button, Card, CardTitle, Input, PageHeader, Select } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { addReferenceItem, renameReferenceItem, toggleReferenceItem } from "../../actions";

export const metadata: Metadata = { title: "Reference data" };

type Kind = "skill" | "industry" | "certification";

function ItemList({ kind, items }: { kind: Kind; items: { id: string; name: string; isActive: boolean; meta?: string | null }[] }) {
  return (
    <ul className="mt-4 max-h-[28rem] divide-y divide-slate-100 overflow-y-auto pr-1">
      {items.map((i) => (
        <li key={i.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
          <form action={renameReferenceItem} className="flex min-w-0 flex-1 items-center gap-2">
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={i.id} />
            <input
              name="name"
              defaultValue={i.name}
              aria-label="Name"
              className={
                i.isActive
                  ? "w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-800 hover:border-slate-200 focus:border-indigo-400 focus:outline-none"
                  : "w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-400 line-through"
              }
            />
            {i.meta && <span className="shrink-0 text-xs text-slate-400">{i.meta}</span>}
            <button className="cursor-pointer text-xs text-slate-400 hover:text-indigo-600">Save</button>
          </form>
          <form action={toggleReferenceItem}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={i.id} />
            <input type="hidden" name="isActive" value={String(!i.isActive)} />
            <button className="cursor-pointer text-xs text-slate-400 hover:text-indigo-600">
              {i.isActive ? "Deactivate" : "Activate"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default async function ReferenceDataPage() {
  await requireOwner();
  const db = getDb();
  const [skills, industries, certifications] = await Promise.all([
    db.select().from(schema.skills).orderBy(asc(schema.skills.name)),
    db.select().from(schema.industries).orderBy(asc(schema.industries.name)),
    db.select().from(schema.certifications).orderBy(asc(schema.certifications.name)),
  ]);

  return (
    <>
      <PageHeader
        title="Reference data"
        description="The picklists used across the platform. Deactivated items stay on existing records but can't be picked for new ones."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Skills ({skills.length})</CardTitle>
          <form action={addReferenceItem} className="flex gap-2">
            <input type="hidden" name="kind" value="skill" />
            <Input name="name" placeholder="New skill" required />
            <Input name="category" placeholder="Category" className="max-w-36" />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
          <ItemList kind="skill" items={skills.map((s) => ({ ...s, meta: s.category }))} />
        </Card>

        <Card>
          <CardTitle>Industries ({industries.length})</CardTitle>
          <form action={addReferenceItem} className="flex gap-2">
            <input type="hidden" name="kind" value="industry" />
            <Input name="name" placeholder="New industry" required />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
          <ItemList kind="industry" items={industries} />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Certifications ({certifications.length})</CardTitle>
          <form action={addReferenceItem} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input type="hidden" name="kind" value="certification" />
            <Input name="name" placeholder="Certification name" required />
            <Input name="issuingBody" placeholder="Issuing body" defaultValue="Salesforce" />
            <Select name="type" defaultValue="consultant">
              {schema.certificationType.enumValues.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
          <ItemList
            kind="certification"
            items={certifications.map((c) => ({ ...c, meta: `${c.issuingBody} · ${c.type.replace("_", " ")}` }))}
          />
        </Card>
      </div>
    </>
  );
}
