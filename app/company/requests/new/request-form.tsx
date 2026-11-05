"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { LEVEL_LABELS, ROLE_LABELS } from "@/lib/utils";
import { createResourceRequest } from "../../actions";

export function ResourceRequestForm({ skills }: { skills: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createResourceRequest, initialFormState);
  const [skillRows, setSkillRows] = useState(3);

  return (
    <form action={action} className="space-y-6">
      {state.error && <Notice tone="danger">{state.error}</Notice>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Project name" className="sm:col-span-2">
          <Input name="project_name" required />
        </Field>
        <Field label="Project description" className="sm:col-span-2">
          <Textarea name="project_description" rows={3} placeholder="Business context, clouds in scope, current stage" />
        </Field>
        <Field label="Role required">
          <Select name="role_required" defaultValue="developer">
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Daily hours required">
          <Input name="daily_hours_required" type="number" min={1} max={12} step="0.5" defaultValue={8} />
        </Field>
        <Field label="Start date">
          <Input name="start_date" type="date" />
        </Field>
        <Field label="End date">
          <Input name="end_date" type="date" />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-200">Skills required</legend>
        {Array.from({ length: skillRows }).map((_, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Select name="skill_id" defaultValue="">
              <option value="">Select a skill…</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select name="skill_level" defaultValue="middle">
              {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSkillRows((n) => n + 1)}
          className="inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-white"
        >
          <Plus size={14} /> Add another skill
        </button>
      </fieldset>

      <Field label="Anything else we should know?">
        <Textarea name="description" rows={4} placeholder="Working pattern, location, budget, interview process…" />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
