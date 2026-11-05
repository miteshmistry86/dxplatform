"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import type { FormState } from "@/lib/form";
import { initialFormState } from "@/lib/form";
import { ROLE_LABELS } from "@/lib/utils";

export interface DetailsDefaults {
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  phone: string | null;
  country: string | null;
  preferredTimezone: string | null;
  linkedinUrl: string | null;
  dateOfBirth: string | null;
  headline: string | null;
  summary: string | null;
  primaryRole: string | null;
  yearsExperience: number | null;
  dayRate: string | null;
  currency: string;
  availableFrom: string | null;
  industryIds: string[];
}

const TIMEZONES = [
  "Europe/London", "Europe/Dublin", "Europe/Lisbon", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "Europe/Rome", "Europe/Amsterdam", "Europe/Stockholm", "Europe/Warsaw", "Europe/Bucharest", "Europe/Athens",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Manila", "Asia/Singapore", "Australia/Sydney",
];

export function DetailsForm({
  defaults,
  industries,
  action,
}: {
  defaults: DetailsDefaults;
  industries: { id: string; name: string }[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name">
          <Input name="first_name" defaultValue={defaults.firstName} required />
        </Field>
        <Field label="Last name" hint="Only your last initial is shown to clients.">
          <Input name="last_name" defaultValue={defaults.lastName} required />
        </Field>
        <Field label="Current job title">
          <Input name="job_title" defaultValue={defaults.jobTitle ?? ""} />
        </Field>
        <Field label="Phone">
          <Input name="phone" type="tel" defaultValue={defaults.phone ?? ""} />
        </Field>
        <Field label="Country">
          <Input name="country" defaultValue={defaults.country ?? ""} />
        </Field>
        <Field label="Preferred timezone">
          <Select name="preferred_timezone" defaultValue={defaults.preferredTimezone ?? ""}>
            <option value="">Select…</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="LinkedIn URL">
          <Input name="linkedin_url" type="url" defaultValue={defaults.linkedinUrl ?? ""} />
        </Field>
        <Field label="Date of birth" hint="Optional. Never shown to clients.">
          <Input name="date_of_birth" type="date" defaultValue={defaults.dateOfBirth ?? ""} />
        </Field>
      </div>

      <div className="h-px bg-white/5" />

      <Field label="Headline" hint="e.g. Revenue Cloud architect for complex quote-to-cash">
        <Input name="headline" defaultValue={defaults.headline ?? ""} maxLength={160} />
      </Field>
      <Field label="Professional summary">
        <Textarea name="summary" rows={5} defaultValue={defaults.summary ?? ""} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Primary role">
          <Select name="primary_role" defaultValue={defaults.primaryRole ?? ""}>
            <option value="">Select…</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Years of Salesforce experience">
          <Input name="years_experience" type="number" min={0} max={60} defaultValue={defaults.yearsExperience ?? ""} />
        </Field>
        <Field label="Available from">
          <Input name="available_from" type="date" defaultValue={defaults.availableFrom ?? ""} />
        </Field>
        <Field label="Day rate" hint="Visible to the DX team only.">
          <Input name="day_rate" type="number" min={0} step="1" defaultValue={defaults.dayRate ?? ""} />
        </Field>
        <Field label="Currency">
          <Select name="currency" defaultValue={defaults.currency}>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </Select>
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-200">Industry experience</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {industries.map((i) => (
            <label key={i.id} className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="industries"
                value={i.id}
                defaultChecked={defaults.industryIds.includes(i.id)}
                className="h-4 w-4 accent-indigo-500"
              />
              {i.name}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </Button>
    </form>
  );
}
