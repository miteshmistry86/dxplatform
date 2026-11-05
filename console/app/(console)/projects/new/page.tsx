import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getOrganisationOptions, getReferenceData } from "@/lib/queries";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage({ searchParams }: PageProps<"/projects/new">) {
  await requireOwner();
  const { company } = await searchParams;
  const [companies, ref] = await Promise.all([getOrganisationOptions(), getReferenceData()]);
  return (
    <>
      <PageHeader back={{ href: "/projects", label: "Projects" }} title="New project" />
      <Card className="max-w-2xl">
        <ProjectForm
          companies={companies}
          industries={ref.industries}
          defaultCompanyId={typeof company === "string" ? company : undefined}
        />
      </Card>
    </>
  );
}
