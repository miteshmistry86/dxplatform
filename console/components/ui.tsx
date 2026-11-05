import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

const buttonStyles: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
  secondary: "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-24", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(field, "pr-8", className)} {...props} />;
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
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)} {...props} />;
}

export function CardTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h2>
      {actions}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

export type Tone = keyof typeof badgeTones;

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function statusTone(status: string): Tone {
  if (["listed", "approved", "fulfilled", "responded", "selected"].includes(status)) return "success";
  if (["rejected", "inactive"].includes(status)) return "danger";
  if (["submitted", "new"].includes(status)) return "info";
  if (["screening", "in_review", "matching", "call_scheduled", "interviewed", "pending"].includes(status)) return "warning";
  return "neutral";
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-block text-sm text-slate-500 hover:text-indigo-600">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "danger" | "success"; children: ReactNode }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-800",
    danger: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return <div className={cn("rounded-lg border px-3.5 py-2.5 text-sm", styles[tone])}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-slate-400">{children}</p>;
}

export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_tr:hover]:bg-slate-50/70">
          {children}
          {empty && (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center text-slate-400">
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Pill filters driven by a query-string parameter. */
export function FilterTabs({
  base,
  param = "status",
  current,
  options,
  extra,
}: {
  base: string;
  param?: string;
  current?: string;
  options: { value?: string; label: string; count?: number }[];
  extra?: Record<string, string | undefined>;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {options.map((o) => {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(extra ?? {})) if (v) qs.set(k, v);
        if (o.value) qs.set(param, o.value);
        const href = qs.size ? `${base}?${qs}` : base;
        const active = o.value === current;
        return (
          <Link
            key={o.value ?? "all"}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition",
              active ? "bg-navy-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn("text-xs", active ? "text-slate-300" : "text-slate-400")}>{o.count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/** Inline select + submit that posts `id` and `status` to a server action. */
export function StatusSelect({
  id,
  value,
  options,
  action,
}: {
  id: string;
  value: string;
  options: Record<string, string>;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={value}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <button className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
        Set
      </button>
    </form>
  );
}

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn("font-medium text-indigo-600 hover:text-indigo-800", className)} {...props} />;
}
