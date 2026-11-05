"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { PERSON_TYPE_LABELS, ROLE_LABELS } from "@/lib/utils";
import { savePerson } from "../../../actions";

const TIMEZONES = [
  "Europe/London", "Europe/Dublin", "Europe/Lisbon", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "Europe/Rome", "Europe/Amsterdam", "Europe/Stockholm", "Europe/Warsaw", "Europe/Bucharest", "Europe/Athens",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Manila", "Asia/Singapore", "Australia/Sydney",
];

export interface PersonDefaults {
  id: string;
  type: string;
  organisationId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
  phone: string | null;
  country: string | null;
  preferredTimezone: string | null;
  linkedinUrl: string | null;
  dateOfBirth: string | null;
  industryIds: string[];
  profile: {
    headline: string | null;
    summary: string | null;
    primaryRole: string | null;
    yearsExperience: number | null;
    dayRate: string | null;
    currency: string;
    availableFrom: string | null;
    openToRemote: boolean;
  } | null;
}

export function PersonForm({
  defaults: d,
  organisations,
  industries,
}: {
  defaults: PersonDefaults;
  organisations: { id: string; name: string }[];
  industries: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(savePerson, initialFormState);
  const p = d.profile;

  return (
    <form action={action} className="space-y-6">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}
      <input type="hidden" name="person_id" value={d.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <Input name="first_name" defaultValue={d.firstName} required />
        </Field>
        <Field label="Last name" hint="Companies only see the last initial.">
          <Input name="last_name" defaultValue={d.lastName} required />
        </Field>
        <Field label="Email" hint="CRM email. The sign-in email lives in Supabase Auth.">
          <Input name="email" type="email" defaultValue={d.email} required />
        </Field>
        <Field label="Phone">
          <Input name="phone" type="tel" defaultValue={d.phone ?? ""} />
        </Field>
        <Field label="Record type">
          <Select name="type" defaultValue={d.type}>
            {Object.entries(PERSON_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Company / partner">
          <Select name="organisation_id" defaultValue={d.organisationId ?? ""}>
            <option value="">None</option>
            {organisations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Current job title">
          <Input name="job_title" defaultValue={d.jobTitle ?? ""} />
        </Field>
        <Field label="Country">
          <Input name="country" defaultValue={d.country ?? ""} />
        </Field>
        <Field label="Preferred timezone">
          <Select name="preferred_timezone" defaultValue={d.preferredTimezone ?? ""}>
            <option value="">Not set</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="LinkedIn URL">
          <Input name="linkedin_url" type="url" defaultValue={d.linkedinUrl ?? ""} />
        </Field>
        <Field label="Date of birth">
          <Input name="date_of_birth" type="date" defaultValue={d.dateOfBirth ?? ""} />
        </Field>
      </div>

      {p && (
        <>
          <div className="h-px bg-slate-200" />
          <Field label="Headline">
            <Input name="headline" defaultValue={p.headline ?? ""} maxLength={160} />
          </Field>
          <Field label="Professional summary">
            <Textarea name="summary" rows={5} defaultValue={p.summary ?? ""} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Primary role">
              <Select name="primary_role" defaultValue={p.primaryRole ?? ""}>
                <option value="">Not set</option>
                {Object.entries(ROLE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Years of experience">
              <Input name="years_experience" type="number" min={0} max={60} defaultValue={p.yearsExperience ?? ""} />
            </Field>
            <Field label="Available from">
              <Input name="available_from" type="date" defaultValue={p.availableFrom ?? ""} />
            </Field>
            <Field label="Day rate">
              <Input name="day_rate" type="number" min={0} step="1" defaultValue={p.dayRate ?? ""} />
            </Field>
            <Field label="Currency">
              <Select name="currency" defaultValue={p.currency}>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
              <input type="checkbox" name="open_to_remote" defaultChecked={p.openToRemote} className="h-4 w-4 accent-indigo-600" />
              Open to remote
            </label>
          </div>
        </>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Industry experience</legend>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
          {industries.map((i) => (
            <label key={i.id} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="industries"
                value={i.id}
                defaultChecked={d.industryIds.includes(i.id)}
                className="h-4 w-4 accent-indigo-600"
              />
              {i.name}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save record"}
      </Button>
    </form>
  );
}
