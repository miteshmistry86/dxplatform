"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { submitContactRequest } from "./actions";

export function ContactForm({ defaultInterest }: { defaultInterest?: string }) {
  const [state, action, pending] = useActionState(submitContactRequest, initialFormState);

  if (state.ok) return <Notice tone="success">{state.message}</Notice>;

  return (
    <form action={action} className="space-y-5">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" required autoComplete="name" />
        </Field>
        <Field label="Work email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Company">
          <Input name="company" autoComplete="organization" />
        </Field>
        <Field label="Phone">
          <Input name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field label="I'm interested in">
        <Select name="interest" defaultValue={defaultInterest ?? "talent"}>
          <option value="talent">Hiring Salesforce talent</option>
          <option value="agentic">The Salesforce Delivery Agent</option>
          <option value="partner">Becoming a consulting partner</option>
          <option value="developer">Joining as a developer</option>
          <option value="other">Something else</option>
        </Select>
      </Field>
      <Field label="Message">
        <Textarea name="message" required rows={5} />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
