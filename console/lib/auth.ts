import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getDb, schema } from "@dx/db";
import { isOwner } from "./owners";
import { createSupabase } from "./supabase";

export interface Owner {
  id: string;
  email: string;
}

/**
 * The signed-in DX owner, or a redirect to sign-in. Call at the top of every
 * page and server action: layouts alone do not re-run on client navigation.
 */
export const requireOwner = cache(async (): Promise<Owner> => {
  const supabase = await createSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");
  if (!isOwner(user.email)) {
    await supabase.auth.signOut();
    redirect("/login?error=forbidden");
  }

  const owner = { id: user.id, email: user.email };
  await ensureOwnerRow(owner);
  return owner;
});

/** Audit and screening records reference users.id, so owners need a row. */
export async function ensureOwnerRow(owner: Owner) {
  await getDb()
    .insert(schema.users)
    .values({ id: owner.id, email: owner.email, role: "admin" })
    .onConflictDoNothing();
}
