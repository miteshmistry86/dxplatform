import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/lib/audit";
import { ensureOwnerRow } from "@/lib/auth";
import { isOwner } from "@/lib/owners";
import { createSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const login = new URL("/login", request.url);
  if (!code) {
    login.searchParams.set("error", "link");
    return NextResponse.redirect(login);
  }

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    login.searchParams.set("error", "link");
    return NextResponse.redirect(login);
  }
  if (!isOwner(data.user.email)) {
    await supabase.auth.signOut();
    login.searchParams.set("error", "forbidden");
    return NextResponse.redirect(login);
  }

  const owner = { id: data.user.id, email: data.user.email! };
  await ensureOwnerRow(owner);
  await audit(owner.id, "console.sign_in", "users", owner.id);
  return NextResponse.redirect(new URL("/", request.url));
}
