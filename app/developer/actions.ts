"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth";
import type { FormState } from "@/lib/form";
import { getFullProfile, profileCompleteness } from "@/lib/queries";
import { optional } from "@/lib/utils";

async function currentPersonId() {
  const user = await requireRole("developer", "partner_admin");
  if (!user.personId) throw new Error("No person record for this user");
  return { user, personId: user.personId };
}

function refresh() {
  revalidatePath("/developer", "layout");
}

const DetailsSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  job_title: z.string().trim().max(120).nullable(),
  phone: z.string().trim().max(40).nullable(),
  country: z.string().trim().max(80).nullable(),
  preferred_timezone: z.string().trim().max(80).nullable(),
  linkedin_url: z.url().nullable(),
  date_of_birth: z.iso.date().nullable(),
  headline: z.string().trim().max(160).nullable(),
  summary: z.string().trim().max(4000).nullable(),
  primary_role: z.enum(schema.resourceRole.enumValues).nullable(),
  years_experience: z.coerce.number().int().min(0).max(60).nullable(),
  day_rate: z.coerce.number().min(0).max(100000).nullable(),
  currency: z.enum(["GBP", "EUR", "USD"]),
  available_from: z.iso.date().nullable(),
});

export async function saveProfileDetails(_: FormState, formData: FormData): Promise<FormState> {
  const { personId } = await currentPersonId();
  const raw = Object.fromEntries(
    Object.keys(DetailsSchema.shape).map((k) => [k, optional(formData.get(k))]),
  );
  const parsed = DetailsSchema.safeParse({ ...raw, currency: raw.currency ?? "GBP" });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const d = parsed.data;
  const industryIds = formData.getAll("industries").map(String);

  await getDb().transaction(async (tx) => {
    await tx
      .update(schema.people)
      .set({
        firstName: d.first_name,
        lastName: d.last_name,
        jobTitle: d.job_title,
        phone: d.phone,
        country: d.country,
        preferredTimezone: d.preferred_timezone,
        linkedinUrl: d.linkedin_url,
        dateOfBirth: d.date_of_birth,
      })
      .where(eq(schema.people.id, personId));

    await tx
      .update(schema.resourceProfiles)
      .set({
        headline: d.headline,
        summary: d.summary,
        primaryRole: d.primary_role,
        yearsExperience: d.years_experience,
        dayRate: d.day_rate?.toString() ?? null,
        currency: d.currency,
        availableFrom: d.available_from,
      })
      .where(eq(schema.resourceProfiles.personId, personId));

    await tx.delete(schema.personIndustries).where(eq(schema.personIndustries.personId, personId));
    if (industryIds.length) {
      await tx
        .insert(schema.personIndustries)
        .values(industryIds.map((industryId) => ({ personId, industryId })));
    }
  });

  refresh();
  return { ok: true, message: "Profile saved." };
}

const SkillSchema = z.object({
  skill_id: z.uuid(),
  level: z.enum(schema.skillLevel.enumValues),
});

export async function addSkill(formData: FormData) {
  const { personId } = await currentPersonId();
  const parsed = SkillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await getDb()
    .insert(schema.assignedSkills)
    .values({ personId, skillId: parsed.data.skill_id, level: parsed.data.level })
    .onConflictDoUpdate({
      target: [schema.assignedSkills.personId, schema.assignedSkills.skillId],
      set: { level: parsed.data.level },
    });
  refresh();
}

export async function removeSkill(formData: FormData) {
  const { personId } = await currentPersonId();
  const id = String(formData.get("id"));
  await getDb()
    .delete(schema.assignedSkills)
    .where(and(eq(schema.assignedSkills.id, id), eq(schema.assignedSkills.personId, personId)));
  refresh();
}

const CertSchema = z.object({
  certification_id: z.uuid(),
  achieved_on: z.iso.date().nullable(),
  credential_url: z.url().nullable(),
});

export async function addCertification(formData: FormData) {
  const { personId } = await currentPersonId();
  const parsed = CertSchema.safeParse({
    certification_id: formData.get("certification_id"),
    achieved_on: optional(formData.get("achieved_on")),
    credential_url: optional(formData.get("credential_url")),
  });
  if (!parsed.success) return;
  await getDb()
    .insert(schema.resourceCertifications)
    .values({
      personId,
      certificationId: parsed.data.certification_id,
      achievedOn: parsed.data.achieved_on,
      credentialUrl: parsed.data.credential_url,
    })
    .onConflictDoNothing();
  refresh();
}

export async function removeCertification(formData: FormData) {
  const { personId } = await currentPersonId();
  const id = String(formData.get("id"));
  await getDb()
    .delete(schema.resourceCertifications)
    .where(
      and(eq(schema.resourceCertifications.id, id), eq(schema.resourceCertifications.personId, personId)),
    );
  refresh();
}

const ExperienceSchema = z.object({
  job_title: z.string().trim().min(1).max(160),
  company_name: z.string().trim().max(160).nullable(),
  start_date: z.iso.date(),
  end_date: z.iso.date().nullable(),
  industry_id: z.uuid().nullable(),
  project_description: z.string().trim().max(4000).nullable(),
});

export async function addExperience(_: FormState, formData: FormData): Promise<FormState> {
  const { personId } = await currentPersonId();
  const raw = Object.fromEntries(
    Object.keys(ExperienceSchema.shape).map((k) => [k, optional(formData.get(k))]),
  );
  const parsed = ExperienceSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please provide a job title and a valid start date." };
  const d = parsed.data;
  if (d.end_date && d.end_date < d.start_date) return { error: "End date must be after start date." };

  await getDb().insert(schema.workExperiences).values({
    personId,
    jobTitle: d.job_title,
    companyName: d.company_name,
    startDate: d.start_date,
    endDate: d.end_date,
    industryId: d.industry_id,
    projectDescription: d.project_description,
  });
  refresh();
  return { ok: true, message: "Experience added." };
}

export async function removeExperience(formData: FormData) {
  const { personId } = await currentPersonId();
  const id = String(formData.get("id"));
  await getDb()
    .delete(schema.workExperiences)
    .where(and(eq(schema.workExperiences.id, id), eq(schema.workExperiences.personId, personId)));
  refresh();
}

export async function submitForScreening() {
  const { personId } = await currentPersonId();
  const full = await getFullProfile(personId);
  if (!full?.profile || !profileCompleteness(full).complete) return;
  if (!["draft", "rejected"].includes(full.profile.status)) return;

  await getDb().transaction(async (tx) => {
    await tx
      .update(schema.resourceProfiles)
      .set({ status: "submitted", submittedAt: new Date() })
      .where(eq(schema.resourceProfiles.id, full.profile!.id));
    await tx.insert(schema.screeningReviews).values({ profileId: full.profile!.id });
  });
  refresh();
}
