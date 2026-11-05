import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Code2,
  FileSearch,
  GitBranch,
  Network,
  Rocket,
  ShieldCheck,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { CtaBanner, FeatureCard, PageHero, Section, SectionHeading } from "@/components/marketing";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Salesforce Delivery Agent: Agentic SDLC",
  description:
    "An autonomous, AI-powered platform that agentifies the Salesforce SDLC, from discovery and architecture to generated, deployable metadata.",
};

const STAGES = [
  {
    icon: <FileSearch size={22} />,
    stage: "01",
    title: "Discovery",
    summary: "Turn workshops and documents into structured requirements in hours, not weeks.",
    outputs: [
      "Stakeholder questionnaires & workshop agendas",
      "Current-state process maps",
      "Epics, user stories & acceptance criteria",
      "Fit-gap analysis against Salesforce capabilities",
    ],
  },
  {
    icon: <Network size={22} />,
    stage: "02",
    title: "Architecture & Solution Design",
    summary: "Generate architecture artefacts aligned to Salesforce well-architected patterns.",
    outputs: [
      "Solution design documents",
      "Data model & ERDs",
      "Integration & sequence diagrams",
      "Security, sharing & identity model",
    ],
  },
  {
    icon: <Code2 size={22} />,
    stage: "03",
    title: "Build",
    summary: "Generate deployable Salesforce metadata for a capability, ready for review.",
    outputs: [
      "Objects, fields, layouts & permission sets",
      "Flows, Apex & Lightning Web Components",
      "OmniStudio & Industries components",
      "Integration scaffolding",
    ],
  },
  {
    icon: <Rocket size={22} />,
    stage: "04",
    title: "Quality & Release",
    summary: "Ship with confidence: tests, analysis and documentation generated alongside the build.",
    outputs: [
      "Apex test classes & coverage",
      "Static code analysis & remediation",
      "Deployment packaging & release notes",
      "As-built technical documentation",
    ],
  },
];

const MODELS = [
  {
    icon: <UserCheck size={20} />,
    title: "AI-Powered Developer",
    body: "A vetted DX resource trained on the Delivery Agent, embedded in your team to accelerate your backlog.",
  },
  {
    icon: <Users size={20} />,
    title: "AI-Powered Pod",
    body: "An architect-led pod (architect, developer and BA) using the toolkit end to end for a defined capability.",
  },
  {
    icon: <Zap size={20} />,
    title: "Accelerated Discovery Sprint",
    body: "A fixed, short engagement producing discovery and design artefacts your team can build from.",
  },
];

export default function AgenticSdlcPage() {
  return (
    <>
      <PageHero
        eyebrow="Salesforce Delivery Agent"
        title={
          <>
            The <span className="text-gradient">agentified</span> Salesforce SDLC
          </>
        }
        description="An autonomous delivery platform that harnesses AI across the full software lifecycle, from discovery to generated metadata, operated by CTA-vetted experts who know when to trust it and when to steer it."
      >
        <ButtonLink href="/contact?interest=agentic" className="px-6 py-3">
          Book a demo <ArrowRight size={16} />
        </ButtonLink>
        <ButtonLink href="#how-it-works" variant="secondary" className="px-6 py-3">
          How it works
        </ButtonLink>
      </PageHero>

      <Section className="pb-0">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <Image
            src="/images/agentic-pipeline.jpg"
            alt="The DX Delivery Agent pipeline: discovery, design, build and release"
            width={1600}
            height={900}
            className="w-full"
            sizes="(min-width: 1280px) 1216px, 100vw"
          />
        </div>
      </Section>

      <Section id="how-it-works">
        <SectionHeading
          eyebrow="How it works"
          title="Four agentic stages, one connected pipeline"
          description="Each stage feeds the next. Requirements become design, design becomes metadata, and humans review at every gate."
        />
        <div className="relative mt-16 space-y-6">
          <div className="absolute bottom-0 left-[27px] top-0 hidden w-px bg-gradient-to-b from-brand-cyan via-brand-indigo to-brand-violet md:block" />
          {STAGES.map((s) => (
            <div key={s.stage} className="relative grid gap-6 md:grid-cols-[56px_1fr]">
              <div className="relative z-10 hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-ink-800 text-brand-cyan md:flex">
                {s.icon}
              </div>
              <div className="glass grid gap-6 rounded-2xl p-7 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <span className="font-mono text-xs text-brand-cyan">STAGE {s.stage}</span>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-3 text-slate-400">{s.summary}</p>
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {s.outputs.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2 rounded-xl border border-white/5 bg-ink-800/60 px-3 py-2.5 text-sm text-slate-300"
                    >
                      <Boxes size={15} className="mt-0.5 shrink-0 text-brand-indigo" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon={<ShieldCheck size={20} />} title="Architect-governed">
            Every artefact passes human review gates set by Certified Technical Architects. AI accelerates, experts
            decide.
          </FeatureCard>
          <FeatureCard icon={<GitBranch size={20} />} title="Fits your DevOps">
            Generated metadata lands in your source control and pipeline, whether that&apos;s DevOps Center, Copado,
            Gearset or plain Git.
          </FeatureCard>
          <FeatureCard icon={<ClipboardList size={20} />} title="Traceable end to end">
            Requirements trace through to design decisions and the metadata that implements them.
          </FeatureCard>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Engagement models"
          title="Put the Delivery Agent to work"
          description="Our core proposition: AI-powered Salesforce talent, trained on our custom toolkit, accelerating your route to delivery."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {MODELS.map((m) => (
            <FeatureCard key={m.title} icon={m.icon} title={m.title}>
              {m.body}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="See the Delivery Agent in action"
        description="We'll walk through a real capability, from discovery notes to deployable metadata."
      >
        <ButtonLink href="/contact?interest=agentic" className="px-6 py-3">
          Book a demo
        </ButtonLink>
        <ButtonLink href="/register/company" variant="secondary" className="px-6 py-3">
          Hire an AI-powered developer
        </ButtonLink>
      </CtaBanner>
    </>
  );
}
