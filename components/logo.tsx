import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="dx-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#dx-grad)" />
      <path
        d="M10 12h6.5a8 8 0 0 1 0 16H10z"
        fill="none"
        stroke="#070b1a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M23 12l8 16M31 12l-8 16" stroke="#070b1a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className="text-[15px] leading-none">
        Developer <span className="text-gradient">Exchange</span>
      </span>
    </Link>
  );
}
