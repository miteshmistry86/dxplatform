import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { RegisterForm } from "../register-form";

export const metadata: Metadata = { title: "Register your company" };

const BENEFITS = [
  "Browse CTA-vetted Salesforce specialists",
  "Request screening calls or book talent directly",
  "Submit resource requests and track their progress",
];

export default async function RegisterCompanyPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Hire vetted Salesforce talent</h1>
      <p className="mt-2 text-slate-400">Create a free company account to get started.</p>
      <ul className="mt-5 space-y-2">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 size={16} className="shrink-0 text-brand-cyan" /> {b}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <RegisterForm accountType="company" />
      </div>
      <p className="mt-8 text-sm text-slate-400">
        Already registered?{" "}
        <Link href="/login" className="text-indigo-300 hover:text-white">
          Sign in
        </Link>
        . Are you a Salesforce professional?{" "}
        <Link href="/register/developer" className="text-indigo-300 hover:text-white">
          Join as a developer
        </Link>
        .
      </p>
    </div>
  );
}
