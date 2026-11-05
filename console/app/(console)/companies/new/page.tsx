import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getReferenceData } from "@/lib/queries";
import { OrganisationForm } from "../organisation-form";

export const metadata: Metadata = { title: "New company" };

export default async function NewCompanyPage() {
  await requireOwner();
  const ref = await getReferenceData();
  return (
    <>
      <PageHeader back={{ href: "/companies", label: "Companies" }} title="New company" />
      <Card className="max-w-2xl">
        <OrganisationForm industries={ref.industries} />
      </Card>
    </>
  );
}
