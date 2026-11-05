"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { REQUEST_STATUS_LABELS, ROLE_LABELS } from "@/lib/utils";
import { saveRequest } from "../../../actions";

export function RequestForm({
  request,
  projects,
}: {
  request: {
    id: string;
    projectId: string | null;
    roleRequired: string;
    status: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    dailyHoursRequired: string | null;
  };
  projects: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(saveRequest, initialFormState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}
      <input type="hidden" name="id" value={request.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role">
          <Select name="role_required" defaultValue={request.roleRequired}>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={request.status}>
            {Object.entries(REQUEST_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Project" className="sm:col-span-2">
          <Select name="project_id" defaultValue={request.projectId ?? ""}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start">
          <Input name="start_date" type="date" defaultValue={request.startDate ?? ""} />
        </Field>
        <Field label="End">
          <Input name="end_date" type="date" defaultValue={request.endDate ?? ""} />
        </Field>
        <Field label="Daily hours">
          <Input
            name="daily_hours_required"
            type="number"
            min={1}
            max={12}
            step="0.5"
            defaultValue={request.dailyHoursRequired ?? ""}
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" rows={4} defaultValue={request.description ?? ""} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save request"}
      </Button>
    </form>
  );
}
