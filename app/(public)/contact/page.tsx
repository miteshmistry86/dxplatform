import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { PageHero, Section } from "@/components/marketing";
import { Card } from "@/components/ui";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Developer Exchange about Salesforce talent or the Salesforce Delivery Agent.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { interest } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s <span className="text-gradient">talk</span>
          </>
        }
        description="Tell us about your project, your team or your career. We usually respond within one business day."
      />
      <Section className="pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-8">
            <ContactForm defaultInterest={typeof interest === "string" ? interest : undefined} />
          </Card>
          <div className="space-y-4">
            {[
              { icon: <MessageSquare size={18} />, title: "Need talent fast?", body: "Create a company account to submit a resource request directly." },
              { icon: <Clock size={18} />, title: "Response time", body: "We aim to respond within one business day." },
              { icon: <Mail size={18} />, title: "Email", body: "hello@developerexchange.com" },
            ].map((i) => (
              <Card key={i.title} className="flex gap-4">
                <div className="text-brand-cyan">{i.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">{i.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{i.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
