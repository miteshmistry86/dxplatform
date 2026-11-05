import { requireRole } from "@/lib/auth";
import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { addReferenceItem, toggleReferenceItem } from "../actions";

export const metadata: Metadata = { title: "Reference data" };

type Kind = "skill" | "industry" | "certification";

function ItemList({ kind, items }: { kind: Kind; items: { id: string; name: string; isActive: boolean; meta?: string | null }[] }) {
  return (
    <ul className="mt-4 max-h-96 divide-y divide-white/5 overflow-y-auto pr-1">
      {items.map((i) => (
        <li key={i.id} className="flex items-center justify-between gap-3 py-2 text-sm">
          <span className={i.isActive ? "text-slate-200" : "text-slate-600 line-through"}>
            {i.name}
            {i.meta && <span className="ml-2 text-xs text-slate-500">{i.meta}</span>}
          </span>
          <form action={toggleReferenceItem}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={i.id} />
            <input type="hidden" name="isActive" value={String(!i.isActive)} />
            <button className="text-xs text-slate-500 hover:text-white">{i.isActive ? "Deactivate" : "Activate"}</button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default async function ReferenceDataPage() {
  await requireRole("admin");
  const db = getDb();
  const [skills, industries, certifications] = await Promise.all([
    db.select().from(schema.skills).orderBy(asc(schema.skills.name)),
    db.select().from(schema.industries).orderBy(asc(schema.industries.name)),
    db.select().from(schema.certifications).orderBy(asc(schema.certifications.name)),
  ]);

  return (
    <>
      <PageHeader title="Reference data" description="Skills, industries and certifications available across the platform." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-white">Skills ({skills.length})</h2>
          <form action={addReferenceItem} className="mt-4 flex gap-2">
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
          <h2 className="font-semibold text-white">Industries ({industries.length})</h2>
          <form action={addReferenceItem} className="mt-4 flex gap-2">
            <input type="hidden" name="kind" value="industry" />
            <Input name="name" placeholder="New industry" required />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
          <ItemList kind="industry" items={industries} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-white">Certifications ({certifications.length})</h2>
          <form action={addReferenceItem} className="mt-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
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
