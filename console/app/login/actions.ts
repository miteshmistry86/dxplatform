"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/lib/form";
import { isOwner } from "@/lib/owners";
import { createSupabase } from "@/lib/supabase";

const SENT = "If that address belongs to a DX owner, a sign-in link is on its way. It expires in one hour.";

export async function requestMagicLink(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { error: "Enter a valid email address." };
  const email = parsed.data;

  // Same response whether or not the address is allowed, so the owner list can't be probed.
  if (!isOwner(email)) return { ok: true, message: SENT };

  const supabase = await createSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.CONSOLE_URL ?? "http://localhost:3001"}/auth/callback`,
    },
  });
  if (error) console.error("Console magic link failed:", error.message);
  return { ok: true, message: SENT };
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
