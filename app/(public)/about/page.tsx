import type { Metadata } from "next";
import { Award, Compass, Eye, ShieldCheck } from "lucide-react";
import { CtaBanner, FeatureCard, PageHero, Section, SectionHeading } from "@/components/marketing";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "About us",
  description: "Developer Exchange is a specialist Salesforce resource provider with CTA-led technical vetting.",
};

const VETTING = [
  ["Profile review", "Experience, certifications and project history are reviewed against the role families we list."],
  ["Technical screening", "A Salesforce Certified Technical Architect runs a technical interview focused on real delivery scenarios."],
  ["Listing", "Approved resources are listed with an anonymised profile: first name and last initial only."],
  ["Ongoing feedback", "Client feedback after each engagement keeps the quality bar high."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Developer Exchange"
        title={
          <>
            The go-to place to <span className="text-gradient">augment your Salesforce team</span>
          </>
        }
        description="We built Developer Exchange because finding genuinely skilled Salesforce specialists, especially in niche areas, shouldn't mean weeks of searching and long-term commitments."
      />

      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon={<Compass size={20} />} title="Our mission">
            Make niche Salesforce expertise accessible on demand, with quality you can trust and terms that fit.
          </FeatureCard>
          <FeatureCard icon={<Eye size={20} />} title="Our view">
            The future of delivery is expert humans amplified by AI. We invest in both the talent and the toolkit.
          </FeatureCard>
          <FeatureCard icon={<Award size={20} />} title="Our standard">
            If a Certified Technical Architect wouldn&apos;t put them on their own project, we don&apos;t list them.
          </FeatureCard>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="CTA-led vetting"
          title="How we vet every resource"
          description="Our technical screening is what separates us from a traditional Salesforce recruiter."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {VETTING.map(([title, body], i) => (
            <div key={title} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-brand-cyan">
                <ShieldCheck size={18} />
                <span className="font-mono text-xs">STEP {i + 1}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner title="Let's talk" description="Whether you're hiring or looking for your next engagement, we'd love to hear from you.">
        <ButtonLink href="/contact" className="px-6 py-3">
          Contact us
        </ButtonLink>
      </CtaBanner>
    </>
  );
}
