import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  const { next } = await searchParams;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
      <p className="mt-2 text-slate-400">Sign in to your Developer Exchange account.</p>
      <div className="mt-8">
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
      <p className="mt-8 text-sm text-slate-400">
        New here?{" "}
        <Link href="/register/company" className="text-indigo-300 hover:text-white">
          Register a company
        </Link>{" "}
        or{" "}
        <Link href="/register/developer" className="text-indigo-300 hover:text-white">
          join as a developer
        </Link>
        .
      </p>
    </div>
  );
}
