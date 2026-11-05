import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="dx-console-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#dx-console-grad)" />
      <path d="M10 12h6.5a8 8 0 0 1 0 16H10z" fill="none" stroke="#0b1024" strokeWidth="3" strokeLinejoin="round" />
      <path d="M23 12l8 16M31 12l-8 16" stroke="#0b1024" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ConsoleWordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className={cn("block text-[15px] font-semibold", dark ? "text-white" : "text-slate-900")}>DX Console</span>
        <span className={cn("block text-[11px] uppercase tracking-widest", dark ? "text-slate-400" : "text-slate-500")}>
          Internal · Owners only
        </span>
      </span>
    </span>
  );
}
