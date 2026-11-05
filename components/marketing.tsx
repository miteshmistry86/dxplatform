import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative mx-auto max-w-7xl px-6 py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-indigo/30 bg-brand-indigo/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-200">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl space-y-4", align === "center" && "mx-auto text-center")}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
      {description && <p className="text-lg leading-relaxed text-slate-400">{description}</p>}
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-2xl p-6 transition hover:border-brand-indigo/40",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-indigo/10 blur-3xl transition group-hover:bg-brand-violet/20" />
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-brand-cyan">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-400">{children}</div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-white/5">
      <div className="grid-backdrop absolute inset-0" />
      <div className="absolute left-1/2 top-0 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-brand-indigo/20 blur-[120px]" />
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">{description}</p>
        {children && <div className="mt-10 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

export function CtaBanner({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-800 px-8 py-16 text-center md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.35),transparent_60%)]" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </div>
    </Section>
  );
}
