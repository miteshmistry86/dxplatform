import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { getDb, schema } from "@/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = (typeof schema.userRole.enumValues)[number];
export type AppUser = typeof schema.users.$inferSelect;

export type AccountType = "company" | "developer";

/** Metadata captured at sign-up and stored on the Supabase auth user. */
export interface SignUpMetadata {
  account_type: AccountType;
  first_name: string;
  last_name: string;
  company_name?: string;
}

function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

async function provisionUser(authUser: User): Promise<AppUser> {
  const db = getDb();
  const meta = (authUser.user_metadata ?? {}) as Partial<SignUpMetadata>;
  const email = authUser.email!;
  const accountType: AccountType = meta.account_type === "company" ? "company" : "developer";
  const role: Role = isAdminEmail(email)
    ? "admin"
    : accountType === "company"
      ? "company_user"
      : "developer";

  return db.transaction(async (tx) => {
    let organisationId: string | null = null;
    if (accountType === "company" && role !== "admin") {
      const [org] = await tx
        .insert(schema.organisations)
        .values({ type: "client_company", name: meta.company_name?.trim() || email.split("@")[1] })
        .returning({ id: schema.organisations.id });
      organisationId = org.id;
    }

    const [person] = await tx
      .insert(schema.people)
      .values({
        type: accountType === "company" ? "client_contact" : "freelancer",
        organisationId,
        firstName: meta.first_name?.trim() || "New",
        lastName: meta.last_name?.trim() || "User",
        email,
      })
      .returning({ id: schema.people.id });

    if (accountType === "developer" && role !== "admin") {
      await tx.insert(schema.resourceProfiles).values({ personId: person.id });
    }

    const [created] = await tx
      .insert(schema.users)
      .values({ id: authUser.id, email, role, personId: person.id, organisationId })
      .onConflictDoNothing()
      .returning();

    return created ?? (await tx.query.users.findFirst({ where: eq(schema.users.id, authUser.id) }))!;
  });
}

/** The signed-in app user (provisioned on first request), or null. */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser?.email) return null;

  const existing = await getDb().query.users.findFirst({
    where: eq(schema.users.id, authUser.id),
  });
  return existing ?? provisionUser(authUser);
});

export function homeFor(role: Role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "company_user":
      return "/company";
    case "partner_admin":
    case "developer":
      return "/developer";
  }
}

/** Use at the top of protected layouts, pages and server actions. */
export async function requireRole(...roles: Role[]): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
