"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth";
import type { FormState } from "@/lib/form";
import { getTalentProfile } from "@/lib/queries";
import { optional } from "@/lib/utils";

async function currentCompanyUser() {
  const user = await requireRole("company_user");
  if (!user.organisationId) throw new Error("Company user has no organisation");
  return { user, organisationId: user.organisationId };
}

const RequestSchema = z.object({
  project_name: z.string().trim().min(2, "Project name is required").max(160),
  project_description: z.string().trim().max(4000).nullable(),
  role_required: z.enum(schema.resourceRole.enumValues),
  description: z.string().trim().max(4000).nullable(),
  start_date: z.iso.date().nullable(),
  end_date: z.iso.date().nullable(),
  daily_hours_required: z.coerce.number().min(1).max(12).nullable(),
});

const SkillRow = z.object({ skillId: z.uuid(), level: z.enum(schema.skillLevel.enumValues) });

export async function createResourceRequest(_: FormState, formData: FormData): Promise<FormState> {
  const { user, organisationId } = await currentCompanyUser();
  const raw = Object.fromEntries(Object.keys(RequestSchema.shape).map((k) => [k, optional(formData.get(k))]));
  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  if (d.start_date && d.end_date && d.end_date < d.start_date) {
    return { error: "End date must be after start date." };
  }

  const skillRows = formData
    .getAll("skill_id")
    .map((skillId, i) => ({ skillId, level: formData.getAll("skill_level")[i] }))
    .filter((r) => r.skillId)
    .map((r) => SkillRow.safeParse(r))
    .filter((r) => r.success)
    .map((r) => r.data);
  const uniqueSkills = [...new Map(skillRows.map((s) => [s.skillId, s])).values()];

  await getDb().transaction(async (tx) => {
    const [project] = await tx
      .insert(schema.projects)
      .values({
        organisationId,
        name: d.project_name,
        description: d.project_description,
        startDate: d.start_date,
        createdByUserId: user.id,
      })
      .returning({ id: schema.projects.id });

    const [request] = await tx
      .insert(schema.resourceRequests)
      .values({
        organisationId,
        projectId: project.id,
        requestedByUserId: user.id,
        roleRequired: d.role_required,
        description: d.description,
        startDate: d.start_date,
        endDate: d.end_date,
        dailyHoursRequired: d.daily_hours_required?.toString() ?? null,
      })
      .returning({ id: schema.resourceRequests.id });

    if (uniqueSkills.length) {
      await tx
        .insert(schema.skillRequirements)
        .values(uniqueSkills.map((s) => ({ resourceRequestId: request.id, ...s })));
    }
  });

  revalidatePath("/company", "layout");
  redirect("/company/requests?submitted=1");
}

const TalentRequestSchema = z.object({
  profile_id: z.uuid(),
  role_required: z.enum(schema.resourceRole.enumValues),
  start_date: z.iso.date().nullable(),
  end_date: z.iso.date().nullable(),
  description: z.string().trim().max(4000).nullable(),
});

export async function requestTalent(_: FormState, formData: FormData): Promise<FormState> {
  const { user, organisationId } = await currentCompanyUser();
  const raw = Object.fromEntries(
    Object.keys(TalentRequestSchema.shape).map((k) => [k, optional(formData.get(k))]),
  );
  const parsed = TalentRequestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const talent = await getTalentProfile(parsed.data.profile_id);
  if (!talent) return { error: "This profile is no longer available." };

  await getDb()
    .insert(schema.resourceRequests)
    .values({
      organisationId,
      requestedByUserId: user.id,
      targetPersonId: talent.personId,
      roleRequired: parsed.data.role_required,
      description: parsed.data.description,
      startDate: parsed.data.start_date,
      endDate: parsed.data.end_date,
    });

  revalidatePath("/company", "layout");
  return {
    ok: true,
    message: `Request sent. Our team will be in touch to arrange screening with ${talent.displayName}.`,
  };
}
