import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileView } from "@/components/profile/profile-view";
import { Card } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getTalentProfile, getWorkExperience } from "@/lib/queries";
import { RequestTalentForm } from "./request-talent-form";

export default async function TalentProfilePage({ params }: PageProps<"/company/talent/[id]">) {
  await requireRole("company_user");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const talent = await getTalentProfile(id);
  if (!talent) notFound();
  const experience = await getWorkExperience(talent.personId);

  return (
    <>
      <Link href="/company/talent" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Back to search
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ProfileView
          data={{
            ...talent,
            // Employer names are withheld from clients to protect anonymity.
            experience: experience.map((e) => ({ ...e, companyName: null })),
          }}
        />
        <div>
          <Card className="sticky top-6">
            <h2 className="text-lg font-semibold text-white">Interested in {talent.displayName}?</h2>
            <p className="mb-5 mt-1 text-sm text-slate-400">
              We&apos;ll arrange a screening call and confirm availability and rates.
            </p>
            <RequestTalentForm profileId={talent.id} defaultRole={talent.primaryRole} />
          </Card>
        </div>
      </div>
    </>
  );
}
