import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getReferenceData } from "@/lib/queries";
import { ResourceRequestForm } from "./request-form";

export const metadata: Metadata = { title: "New resource request" };

export default async function NewRequestPage() {
  await requireRole("company_user");
  const { skills } = await getReferenceData();

  return (
    <>
      <PageHeader
        title="Submit a resource request"
        description="Tell us what you need. Our team will review it and shortlist CTA-vetted talent."
      />
      <Card className="max-w-3xl p-8">
        <ResourceRequestForm skills={skills} />
      </Card>
    </>
  );
}
