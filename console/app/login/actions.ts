"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { ensureOwnerRow } from "@/lib/auth";
import type { FormState } from "@/lib/form";
import { isOwner } from "@/lib/owners";
import { createSupabase } from "@/lib/supabase";

const REJECTED = "Those details are not recognised.";

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const email = z.email().safeParse(String(formData.get("username") ?? "").trim().toLowerCase());
  const password = String(formData.get("password") ?? "");
  if (!email.success || !password || !isOwner(email.data)) return { error: REJECTED };

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.data, password });
  if (error || !data.user) return { error: REJECTED };

  const owner = { id: data.user.id, email: email.data };
  await ensureOwnerRow(owner);
  await audit(owner.id, "console.sign_in", "users", owner.id);
  redirect("/");
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
