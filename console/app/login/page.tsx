import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { ConsoleWordmark } from "@/components/logo";
import { Notice } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  forbidden: "That account is not authorised to use the DX Console.",
  link: "That sign-in link is invalid or has expired. Request a new one.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <ConsoleWordmark dark />
        </div>
        <div className="rounded-2xl bg-white p-7 shadow-xl">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 mb-5 text-sm text-slate-500">Restricted to Developer Exchange owners.</p>
          {message && (
            <div className="mb-4">
              <Notice tone="danger">{message}</Notice>
            </div>
          )}
          <LoginForm />
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={13} /> Access is logged. Open the link in this browser.
        </p>
      </div>
    </main>
  );
}
