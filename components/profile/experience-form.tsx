"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import type { FormState } from "@/lib/form";
import { initialFormState } from "@/lib/form";

export function ExperienceForm({
  industries,
  action,
}: {
  industries: { id: string; name: string }[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title">
          <Input name="job_title" required />
        </Field>
        <Field label="Company / client">
          <Input name="company_name" />
        </Field>
        <Field label="Start date">
          <Input name="start_date" type="date" required />
        </Field>
        <Field label="End date" hint="Leave blank if current.">
          <Input name="end_date" type="date" />
        </Field>
        <Field label="Industry" className="sm:col-span-2">
          <Select name="industry_id" defaultValue="">
            <option value="">Select…</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Project description" hint="What you delivered, the clouds used and your role.">
        <Textarea name="project_description" rows={4} />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add experience"}
      </Button>
    </form>
  );
}
