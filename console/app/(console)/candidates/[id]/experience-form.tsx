"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { addExperience } from "../../../actions";

export function ExperienceForm({ personId, industries }: { personId: string; industries: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(addExperience, initialFormState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}
      <input type="hidden" name="person_id" value={personId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title">
          <Input name="job_title" required />
        </Field>
        <Field label="Company">
          <Input name="company_name" />
        </Field>
        <Field label="Start date">
          <Input name="start_date" type="date" required />
        </Field>
        <Field label="End date" hint="Leave empty if current.">
          <Input name="end_date" type="date" />
        </Field>
        <Field label="Industry" className="sm:col-span-2">
          <Select name="industry_id" defaultValue="">
            <option value="">None</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Project description">
        <Textarea name="project_description" rows={3} />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add experience"}
      </Button>
    </form>
  );
}
