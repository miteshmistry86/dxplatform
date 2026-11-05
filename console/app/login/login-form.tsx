"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { requestMagicLink } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initialFormState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.message}</Notice>}
      <Field label="Work email">
        <Input name="email" type="email" autoComplete="email" required autoFocus placeholder="you@developerexchange.com" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
