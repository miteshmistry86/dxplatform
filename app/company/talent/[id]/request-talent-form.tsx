"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { ROLE_LABELS } from "@/lib/utils";
import { requestTalent } from "../../actions";

export function RequestTalentForm({ profileId, defaultRole }: { profileId: string; defaultRole: string | null }) {
  const [state, action, pending] = useActionState(requestTalent, initialFormState);

  if (state.ok) return <Notice tone="success">{state.message}</Notice>;

  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <input type="hidden" name="profile_id" value={profileId} />
      <Field label="Role">
        <Select name="role_required" defaultValue={defaultRole ?? "developer"}>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start">
          <Input name="start_date" type="date" />
        </Field>
        <Field label="End">
          <Input name="end_date" type="date" />
        </Field>
      </div>
      <Field label="About the engagement">
        <Textarea name="description" rows={4} placeholder="Project context, scope and working pattern" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Request screening / booking"}
      </Button>
    </form>
  );
}
