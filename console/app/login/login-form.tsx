"use client";

import { useActionState } from "react";
import { Button, Field, Input, Notice } from "@/components/ui";
import { initialFormState } from "@/lib/form";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialFormState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <Field label="Username">
        <Input name="username" type="email" autoComplete="username" required autoFocus placeholder="you@dx.digital" />
      </Field>
      <Field label="Password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
