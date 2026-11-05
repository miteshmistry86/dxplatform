"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { signIn } from "../actions";
import { submitWithFields } from "../submit-form";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initialFormState);

  return (
    <form onSubmit={submitWithFields(action)} className="space-y-5">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <Input name="password" type="password" required autoComplete="current-password" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
