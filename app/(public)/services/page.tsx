import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Bot, CalendarClock, Handshake, UserPlus, Users } from "lucide-react";
import { CtaBanner, FeatureCard, PageHero, Section, SectionHeading } from "@/components/marketing";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description: "Flexible Salesforce resourcing, team assembly, AI-powered delivery and CTA-led technical assurance.",
};

const SERVICES = [
  {
    icon: <UserPlus size={20} />,
    title: "Talent on demand",
    body: "Augment your team with individual specialists. Browse the catalogue, shortlist, screen and book, all in one place.",
  },
  {
    icon: <Users size={20} />,
    title: "Team assembly",
    body: "Tell us the capability you're building. We'll formulate the right blend of architects, developers, BAs and QA.",
  },
  {
    icon: <Bot size={20} />,
    title: "AI-powered delivery",
    body: "Resources trained on the DX Salesforce Delivery Agent who accelerate discovery, design and build.",
  },
  {
    icon: <BadgeCheck size={20} />,
    title: "CTA technical assurance",
    body: "Every resource is technically screened by a Salesforce CTA before they are listed, so quality is built in.",
  },
];

const TERMS = [
  ["Daily", "Short, sharp expertise: health checks, design reviews, spikes."],
  ["Weekly", "Burst capacity for sprints, releases and go-lives."],
  ["Project", "Full engagement for a defined capability or phase."],
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Salesforce resourcing, <span className="text-gradient">reimagined</span>
          </>
        }
        description="One digital-first platform to find, vet and book niche Salesforce talent, without long-term agreements or trawling through multiple consultancies."
      >
        <ButtonLink href="/register/company" className="px-6 py-3">
          Get started <ArrowRight size={16} />
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {SERVICES.map((s) => (
            <FeatureCard key={s.title} icon={s.icon} title={s.title} className="p-8">
              {s.body}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Flexible booking"
          title="Contracts tailored to the work"
          description="Book exactly the capacity you need, for as long as you need it."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TERMS.map(([title, body]) => (
            <FeatureCard key={title} icon={<CalendarClock size={20} />} title={title}>
              {body}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <FeatureCard icon={<Handshake size={20} />} title="A trusted partner network" className="p-10">
          Our talent pool combines independent freelancers with resources from trusted consulting partners worldwide.
          Onshore when you need proximity, offshore when you need scale, and always technically vetted.
        </FeatureCard>
      </Section>

      <CtaBanner title="Ready to augment your team?" description="Create a company account and tell us what you need.">
        <ButtonLink href="/register/company" className="px-6 py-3">
          Create company account
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary" className="px-6 py-3">
          Talk to us
        </ButtonLink>
      </CtaBanner>
    </>
  );
}
