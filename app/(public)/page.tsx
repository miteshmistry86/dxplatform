import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  CalendarRange,
  Cable,
  Database,
  Globe2,
  Layers,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { CtaBanner, Eyebrow, FeatureCard, Section, SectionHeading } from "@/components/marketing";
import { ButtonLink } from "@/components/ui";

const SPECIALISMS = [
  { icon: <Layers size={20} />, title: "Revenue Cloud & CPQ", body: "Quote-to-cash, pricing, contracts and billing specialists." },
  { icon: <Blocks size={20} />, title: "Salesforce Industries", body: "OmniStudio, FSC, Insurance, Comms and Energy & Utilities clouds." },
  { icon: <Cable size={20} />, title: "MuleSoft", body: "API-led integration architects and developers." },
  { icon: <Bot size={20} />, title: "Agentforce & Data Cloud", body: "Grounded AI agents built on unified customer data." },
  { icon: <ShoppingCart size={20} />, title: "Commerce Cloud", body: "B2B and B2C storefronts, from build to optimisation." },
  { icon: <Database size={20} />, title: "Core Platform", body: "Sales, Service and Experience Cloud architects, devs and BAs." },
];

const WHY = [
  {
    icon: <ShieldCheck size={20} />,
    title: "Every profile vetted by a CTA",
    body: "A Salesforce Certified Technical Architect screens every resource before they are listed. Recruiters can't offer that.",
  },
  {
    icon: <CalendarRange size={20} />,
    title: "Flexible booking, no lock-in",
    body: "Book for days, weeks or months. Shape the contract around your project rather than the other way round.",
  },
  {
    icon: <Globe2 size={20} />,
    title: "One platform, global talent",
    body: "Trusted consulting partners and freelancers across onshore and offshore locations, all in one place.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "AI-accelerated delivery",
    body: "Resources trained on the DX Salesforce Delivery Agent ship discovery, design and build faster.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <Image
          src="/images/hero-network.jpg"
          alt=""
          fill
          priority
          className="object-cover object-right opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/10" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40">
          <div className="max-w-2xl">
            <Eyebrow>
              <BadgeCheck size={14} /> Every resource vetted by a Salesforce CTA
            </Eyebrow>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Niche Salesforce talent, <span className="text-gradient">booked on your terms.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              Skip the endless search across consultancies. Browse vetted Revenue Cloud, Industries and MuleSoft
              specialists, or tell us what you need and we&apos;ll assemble the team. Every resource can be
              accelerated by our agentic delivery toolkit.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/register/company" className="px-6 py-3">
                Find talent <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/agentic-sdlc" variant="secondary" className="px-6 py-3">
                Explore the Delivery Agent
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-b border-white/5 bg-ink-950/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-center md:grid-cols-4">
          {[
            ["100%", "CTA technical screening"],
            ["Days", "not months, to onboard"],
            ["EU · UK · US", "clients supported"],
            ["Flexible", "daily, weekly or project terms"],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="text-2xl font-semibold text-white">{stat}</div>
              <div className="mt-1 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialisms */}
      <Section>
        <SectionHeading
          eyebrow="Specialisms"
          title="The skills that are hardest to find"
          description="We focus on niche, high-demand Salesforce capabilities where the right person makes or breaks delivery."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SPECIALISMS.map((s) => (
            <FeatureCard key={s.title} icon={s.icon} title={s.title}>
              {s.body}
            </FeatureCard>
          ))}
        </div>
      </Section>

      {/* Why DX */}
      <Section className="pt-0">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            align="left"
            eyebrow="Why Developer Exchange"
            title={
              <>
                Not a recruiter. <span className="text-gradient">A technical partner.</span>
              </>
            }
            description="We combine a curated talent marketplace with architect-level quality control, so you get people who can actually deliver."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {WHY.map((w) => (
              <FeatureCard key={w.title} icon={w.icon} title={w.title}>
                {w.body}
              </FeatureCard>
            ))}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section className="pt-0">
        <SectionHeading eyebrow="How it works" title="Two ways to build your team" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 text-brand-cyan">
              <Search size={22} />
              <span className="text-sm font-semibold uppercase tracking-wider">Search & book</span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">Browse the vetted catalogue</h3>
            <ol className="mt-6 space-y-4 text-slate-300">
              {["Search by skill, certification, industry or experience", "Review anonymised, CTA-vetted profiles", "Request a screening call or book directly"].map(
                (step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-indigo/20 text-xs font-semibold text-indigo-200">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </div>
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 text-brand-violet">
              <Users size={22} />
              <span className="text-sm font-semibold uppercase tracking-wider">Tell us what you need</span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">Let us assemble the team</h3>
            <ol className="mt-6 space-y-4 text-slate-300">
              {["Submit a resource request with roles, skills and dates", "Our team shortlists matching talent", "Interview, select and start, on flexible terms"].map(
                (step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-violet/20 text-xs font-semibold text-violet-200">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>
      </Section>

      {/* Agentic teaser */}
      <Section className="pt-0">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-950">
          <div className="grid items-center lg:grid-cols-2">
            <div className="p-10 md:p-14">
              <Eyebrow>
                <Workflow size={14} /> Salesforce Delivery Agent
              </Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                AI-powered developers. <span className="text-gradient">An agentified SDLC.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-400">
                Our autonomous delivery platform generates discovery materials, architecture artefacts, solution
                designs and deployable Salesforce metadata. DX resources are trained to wield it, so you get
                senior-level output, faster.
              </p>
              <ButtonLink href="/agentic-sdlc" variant="secondary" className="mt-8">
                See how it works <ArrowRight size={16} />
              </ButtonLink>
            </div>
            <div className="relative aspect-video lg:aspect-auto lg:h-full">
              <Image
                src="/images/agentic-pipeline.jpg"
                alt="Illustration of the DX agentic delivery pipeline from discovery to deployment"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </Section>

      <CtaBanner
        title="Build your Salesforce team today"
        description="Hiring? Browse vetted specialists. Salesforce expert? Join a network built around quality."
      >
        <ButtonLink href="/register/company" className="px-6 py-3">
          Hire talent
        </ButtonLink>
        <ButtonLink href="/register/developer" variant="secondary" className="px-6 py-3">
          Join as a developer
        </ButtonLink>
      </CtaBanner>
    </>
  );
}
