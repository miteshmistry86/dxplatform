"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/lib/form";
import type { SignUpMetadata } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

/** Reads one text field. Missing fields become "" so validation can name them. */
function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignInSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
    next: field(formData, "next") || undefined,
  });
  if (!parsed.success) return { error: "Please enter your email and password." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error?.code === "email_not_confirmed") {
    return { error: "Please confirm your email address using the link we sent you, then sign in." };
  }
  if (error) return { error: "Invalid email or password." };

  redirect(safeNext(parsed.data.next));
}

// Supabase Auth hashes passwords with bcrypt, which only uses the first 72 bytes.
const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number");

const SignUpSchema = z
  .object({
    account_type: z.enum(["company", "developer"]),
    first_name: z.string().trim().min(1, "First name is required").max(80),
    last_name: z.string().trim().min(1, "Last name is required").max(80),
    company_name: z.string().trim().max(160).optional(),
    email: z.email("Please enter a valid email"),
    password: PasswordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm_password, { message: "Passwords do not match" });

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const values = {
    first_name: field(formData, "first_name"),
    last_name: field(formData, "last_name"),
    company_name: field(formData, "company_name"),
    email: field(formData, "email"),
  };
  const fail = (error: string): FormState => ({ error, values });

  const parsed = SignUpSchema.safeParse({
    ...values,
    account_type: field(formData, "account_type"),
    password: field(formData, "password"),
    confirm_password: field(formData, "confirm_password"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

  const { email, password, account_type, first_name, last_name, company_name } = parsed.data;
  if (account_type === "company" && !company_name) {
    return fail("Company name is required");
  }

  const metadata: SignUpMetadata = { account_type, first_name, last_name, company_name };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) return fail(error.message);

  // With email confirmation on, Supabase returns a user with no identities for an existing email.
  if (data.user && data.user.identities?.length === 0) {
    return fail("An account with this email already exists. Please sign in instead.");
  }

  if (data.session) redirect("/dashboard");
  return {
    ok: true,
    message: "Check your inbox. We've sent you a link to confirm your email address.",
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
