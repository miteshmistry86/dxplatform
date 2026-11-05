"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Field, Input, Notice } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { signUp } from "../actions";
import { submitWithFields } from "../submit-form";

export function RegisterForm({ accountType }: { accountType: "company" | "developer" }) {
  const [state, action, pending] = useActionState(signUp, initialFormState);
  const v = state.values ?? {};

  if (state.ok) return <Notice tone="success">{state.message}</Notice>;

  return (
    <form onSubmit={submitWithFields(action)} className="space-y-5">
      {state.error && (
        <Notice tone="danger">
          {state.error}
          {state.error.includes("already exists") && (
            <>
              {" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </>
          )}
        </Notice>
      )}
      <input type="hidden" name="account_type" value={accountType} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name">
          <Input name="first_name" required autoComplete="given-name" defaultValue={v.first_name} />
        </Field>
        <Field label="Last name">
          <Input name="last_name" required autoComplete="family-name" defaultValue={v.last_name} />
        </Field>
      </div>
      {accountType === "company" && (
        <Field label="Company name">
          <Input name="company_name" required autoComplete="organization" defaultValue={v.company_name} />
        </Field>
      )}
      <Field label={accountType === "company" ? "Work email" : "Email"}>
        <Input name="email" type="email" required autoComplete="email" defaultValue={v.email} />
      </Field>
      <Field label="Password" hint="8+ characters with an uppercase letter, a lowercase letter and a number.">
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm password">
        <Input name="confirm_password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-xs text-slate-500">
        {accountType === "developer"
          ? "Clients will only ever see your first name and last initial until you're engaged."
          : "We'll send a confirmation link to verify your email before you can sign in."}
      </p>
    </form>
  );
}
