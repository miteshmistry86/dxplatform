import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/services", label: "Services" },
      { href: "/agentic-sdlc", label: "Salesforce Delivery Agent" },
      { href: "/register/company", label: "Hire talent" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/for-developers", label: "Why join DX" },
      { href: "/register/developer", label: "Apply to join" },
      { href: "/login", label: "Developer sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-slate-400">
            CTA-vetted Salesforce specialists, booked on flexible terms and accelerated by agentic delivery.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-6 py-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Developer Exchange. All rights reserved.</p>
          <p>Salesforce, MuleSoft and related marks are trademarks of Salesforce, Inc.</p>
        </div>
      </div>
    </footer>
  );
}
