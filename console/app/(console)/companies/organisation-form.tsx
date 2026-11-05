"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { saveOrganisation } from "../../actions";

export interface OrganisationDefaults {
  id: string;
  type: string;
  name: string;
  companyEmail: string | null;
  website: string | null;
  industryId: string | null;
  size: string | null;
  billingLine1: string | null;
  billingLine2: string | null;
  billingCity: string | null;
  billingPostcode: string | null;
  billingCountry: string | null;
}

const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"];

export function OrganisationForm({
  defaults: d,
  industries,
}: {
  defaults?: OrganisationDefaults;
  industries: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(saveOrganisation, initialFormState);

  return (
    <form action={action} className="space-y-5">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}
      {d?.id && <input type="hidden" name="id" value={d.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" className="sm:col-span-2">
          <Input name="name" required defaultValue={d?.name ?? ""} />
        </Field>
        <Field label="Type">
          <Select name="type" defaultValue={d?.type ?? "client_company"}>
            <option value="client_company">Client company</option>
            <option value="consulting_partner">Consulting partner</option>
          </Select>
        </Field>
        <Field label="Size">
          <Select name="size" defaultValue={d?.size ?? ""}>
            <option value="">Unknown</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Company email">
          <Input name="company_email" type="email" defaultValue={d?.companyEmail ?? ""} />
        </Field>
        <Field label="Website">
          <Input name="website" type="url" placeholder="https://" defaultValue={d?.website ?? ""} />
        </Field>
        <Field label="Industry" className="sm:col-span-2">
          <Select name="industry_id" defaultValue={d?.industryId ?? ""}>
            <option value="">None</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Billing address" className="sm:col-span-2">
          <Input name="billing_line1" placeholder="Line 1" defaultValue={d?.billingLine1 ?? ""} />
        </Field>
        <Field label="Address line 2" className="sm:col-span-2">
          <Input name="billing_line2" defaultValue={d?.billingLine2 ?? ""} />
        </Field>
        <Field label="City">
          <Input name="billing_city" defaultValue={d?.billingCity ?? ""} />
        </Field>
        <Field label="Postcode">
          <Input name="billing_postcode" defaultValue={d?.billingPostcode ?? ""} />
        </Field>
        <Field label="Country">
          <Input name="billing_country" defaultValue={d?.billingCountry ?? ""} />
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : d?.id ? "Save company" : "Create company"}
      </Button>
    </form>
  );
}
