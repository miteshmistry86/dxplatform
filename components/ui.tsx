import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-ink-950 font-semibold shadow-[0_0_30px_-8px_rgba(99,102,241,0.8)] hover:brightness-110",
  secondary: "glass text-white hover:bg-white/10",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  danger: "bg-rose-500/90 text-white hover:bg-rose-500",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cn(base, buttonStyles[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, buttonStyles[variant], className)} {...props} />;
}

const field =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/30";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-28", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(field, "appearance-none", className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("glass rounded-2xl p-6", className)} {...props} />;
}

const badgeTones = {
  neutral: "bg-white/5 text-slate-300 border-white/10",
  brand: "bg-brand-indigo/15 text-indigo-200 border-brand-indigo/30",
  cyan: "bg-brand-cyan/10 text-cyan-200 border-brand-cyan/30",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  danger: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof badgeTones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function statusTone(status: string): keyof typeof badgeTones {
  if (["listed", "approved", "fulfilled", "responded"].includes(status)) return "success";
  if (["rejected", "closed", "inactive"].includes(status)) return "danger";
  if (["submitted", "screening", "in_review", "matching", "call_scheduled"].includes(status))
    return "warning";
  return "neutral";
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Notice({ tone = "brand", children }: { tone?: "brand" | "danger" | "success"; children: ReactNode }) {
  const styles = {
    brand: "border-brand-indigo/30 bg-brand-indigo/10 text-indigo-100",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  };
  return <div className={cn("rounded-xl border px-4 py-3 text-sm", styles[tone])}>{children}</div>;
}
