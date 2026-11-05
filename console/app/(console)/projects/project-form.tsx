"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { saveProject } from "../../actions";

export function ProjectForm({
  defaults,
  defaultCompanyId,
  companies,
  industries,
  selectedIndustryIds = [],
}: {
  defaults?: {
    id: string;
    organisationId: string;
    name: string;
    description: string | null;
    startDate: string | null;
    durationWeeks: number | null;
  };
  defaultCompanyId?: string;
  companies: { id: string; name: string }[];
  industries: { id: string; name: string }[];
  selectedIndustryIds?: string[];
}) {
  const [state, action, pending] = useActionState(saveProject, initialFormState);

  return (
    <form action={action} className="space-y-5">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <Field label="Company">
        <Select name="organisation_id" required defaultValue={defaults?.organisationId ?? defaultCompanyId ?? ""}>
          <option value="" disabled>
            Select a company…
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Project name">
        <Input name="name" required defaultValue={defaults?.name ?? ""} />
      </Field>
      <Field label="Description">
        <Textarea name="description" rows={4} defaultValue={defaults?.description ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date">
          <Input name="start_date" type="date" defaultValue={defaults?.startDate ?? ""} />
        </Field>
        <Field label="Duration (weeks)">
          <Input name="duration_weeks" type="number" min={1} defaultValue={defaults?.durationWeeks ?? ""} />
        </Field>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Industries</legend>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
          {industries.map((i) => (
            <label key={i.id} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="industries"
                value={i.id}
                defaultChecked={selectedIndustryIds.includes(i.id)}
                className="h-4 w-4 accent-indigo-600"
              />
              {i.name}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : defaults?.id ? "Save project" : "Create project"}
      </Button>
    </form>
  );
}
