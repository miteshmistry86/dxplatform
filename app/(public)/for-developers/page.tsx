import type { Metadata } from "next";
import { ArrowRight, Bot, Briefcase, EyeOff, Globe2 } from "lucide-react";
import { CtaBanner, FeatureCard, PageHero, Section, SectionHeading } from "@/components/marketing";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Developers",
  description: "Join the Developer Exchange network of CTA-vetted Salesforce specialists.",
};

const STEPS = [
  ["Register", "Create your account in under a minute."],
  ["Build your profile", "Add skills and proficiency, certifications, industries and work experience."],
  ["CTA screening", "Our team reviews your profile and may book a short technical call."],
  ["Get listed & booked", "Your anonymised profile goes live to clients across the EU, UK and US."],
];

export default function ForDevelopersPage() {
  return (
    <>
      <PageHero
        eyebrow="For Salesforce professionals"
        title={
          <>
            Do the work you&apos;re <span className="text-gradient">best at</span>
          </>
        }
        description="Join a curated network of Salesforce specialists. Get matched to quality engagements with clients who value deep expertise."
      >
        <ButtonLink href="/register/developer" className="px-6 py-3">
          Apply to join <ArrowRight size={16} />
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Briefcase size={20} />} title="Quality engagements">
            Niche, well-scoped work with clients who need your specialism.
          </FeatureCard>
          <FeatureCard icon={<Globe2 size={20} />} title="Work globally">
            Access clients across the EU, UK and US, remotely or on-site.
          </FeatureCard>
          <FeatureCard icon={<EyeOff size={20} />} title="Privacy first">
            Clients see your first name and last initial only until you&apos;re engaged.
          </FeatureCard>
          <FeatureCard icon={<Bot size={20} />} title="AI-powered toolkit">
            Get trained on the DX Salesforce Delivery Agent and deliver faster.
          </FeatureCard>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="The process" title="From registration to first booking" />
        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <div key={title} className="glass rounded-2xl p-6">
              <span className="text-gradient text-3xl font-semibold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner title="Ready to join?" description="It takes a few minutes to register and start your profile.">
        <ButtonLink href="/register/developer" className="px-6 py-3">
          Apply to join
        </ButtonLink>
      </CtaBanner>
    </>
  );
}
