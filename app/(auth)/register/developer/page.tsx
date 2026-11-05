import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { RegisterForm } from "../register-form";

export const metadata: Metadata = { title: "Join as a developer" };

export default async function RegisterDeveloperPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Join the network</h1>
      <p className="mt-2 text-slate-400">
        Create your account, build your profile and submit it for CTA screening.
      </p>
      <div className="mt-8">
        <RegisterForm accountType="developer" />
      </div>
      <p className="mt-8 text-sm text-slate-400">
        Already registered?{" "}
        <Link href="/login" className="text-indigo-300 hover:text-white">
          Sign in
        </Link>
        . Hiring?{" "}
        <Link href="/register/company" className="text-indigo-300 hover:text-white">
          Register a company
        </Link>
        .
      </p>
    </div>
  );
}
