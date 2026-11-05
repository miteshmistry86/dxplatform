import Image from "next/image";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-white/5 lg:block">
        <Image src="/images/hero-network.jpg" alt="" fill className="object-cover" sizes="50vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-2xl font-semibold leading-snug text-white">
            Every Developer Exchange resource is technically vetted by a Salesforce Certified Technical Architect.
          </p>
        </div>
      </div>
    </div>
  );
}
