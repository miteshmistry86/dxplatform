"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@dx/db";
import { audit } from "@/lib/audit";
import { requireOwner } from "@/lib/auth";
import type { FormState } from "@/lib/form";
import { optional } from "@/lib/utils";

function refresh() {
  revalidatePath("/", "layout");
}

const blank = z.literal("");

// ---------------------------------------------------------------------------
// Screening & statuses
// ---------------------------------------------------------------------------

const DECISIONS = {
  start: { status: "screening", outcome: "pending" },
  schedule: { status: "screening", outcome: "call_scheduled" },
  approve: { status: "listed", outcome: "approved" },
  reject: { status: "rejected", outcome: "rejected" },
} as const;

export async function recordScreeningDecision(formData: FormData) {
  const owner = await requireOwner();
  const parsed = z
    .object({
      profile_id: z.uuid(),
      decision: z.enum(["start", "schedule", "approve", "reject"]),
      notes: z.string().trim().max(4000).nullable(),
      call_scheduled_at: z.string().nullable(),
    })
    .safeParse({
      profile_id: formData.get("profile_id"),
      decision: formData.get("decision"),
      notes: optional(formData.get("notes")),
      call_scheduled_at: optional(formData.get("call_scheduled_at")),
    });
  if (!parsed.success) return;
  const { profile_id, decision, notes, call_scheduled_at } = parsed.data;
  const { status, outcome } = DECISIONS[decision];
  const final = decision === "approve" || decision === "reject";

  await getDb().transaction(async (tx) => {
    await tx
      .update(schema.resourceProfiles)
      .set({ status, ...(decision === "approve" ? { listedAt: new Date(), ctaVetted: true } : {}) })
      .where(eq(schema.resourceProfiles.id, profile_id));
    await tx.insert(schema.screeningReviews).values({
      profileId: profile_id,
      reviewerUserId: owner.id,
      outcome,
      notes,
      callScheduledAt: call_scheduled_at ? new Date(call_scheduled_at) : null,
      decidedAt: final ? new Date() : null,
    });
  });

  await audit(owner.id, `screening.${decision}`, "resource_profiles", profile_id, { notes });
  refresh();
}

export async function setProfileStatus(formData: FormData) {
  const owner = await requireOwner();
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.profileStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.resourceProfiles).set({ status }).where(eq(schema.resourceProfiles.id, id));
  await audit(owner.id, "profile.status", "resource_profiles", id, { status });
  refresh();
}

export async function setRequestStatus(formData: FormData) {
  const owner = await requireOwner();
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.requestStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.resourceRequests).set({ status }).where(eq(schema.resourceRequests.id, id));
  await audit(owner.id, "request.status", "resource_requests", id, { status });
  refresh();
}

export async function setContactStatus(formData: FormData) {
  const owner = await requireOwner();
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.contactRequestStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.contactRequests).set({ status }).where(eq(schema.contactRequests.id, id));
  await audit(owner.id, "contact.status", "contact_requests", id, { status });
  refresh();
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export async function saveOrganisation(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const parsed = z
    .object({
      id: z.union([blank, z.uuid()]),
      type: z.enum(schema.organisationType.enumValues),
      name: z.string().trim().min(1, "Name is required").max(160),
      company_email: z.union([blank, z.email("Enter a valid email")]),
      website: z.union([blank, z.url("Enter a valid website, including https://")]),
      industry_id: z.union([blank, z.uuid()]),
      size: z.union([blank, z.enum(schema.companySize.enumValues)]),
      billing_line1: z.string().trim().max(160),
      billing_line2: z.string().trim().max(160),
      billing_city: z.string().trim().max(80),
      billing_postcode: z.string().trim().max(20),
      billing_country: z.string().trim().max(80),
    })
    .safeParse({
      id: optional(formData.get("id")) ?? "",
      type: formData.get("type"),
      name: formData.get("name"),
      company_email: optional(formData.get("company_email")) ?? "",
      website: optional(formData.get("website")) ?? "",
      industry_id: optional(formData.get("industry_id")) ?? "",
      size: optional(formData.get("size")) ?? "",
      billing_line1: optional(formData.get("billing_line1")) ?? "",
      billing_line2: optional(formData.get("billing_line2")) ?? "",
      billing_city: optional(formData.get("billing_city")) ?? "",
      billing_postcode: optional(formData.get("billing_postcode")) ?? "",
      billing_country: optional(formData.get("billing_country")) ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  const values = {
    type: d.type,
    name: d.name,
    companyEmail: d.company_email || null,
    website: d.website || null,
    industryId: d.industry_id || null,
    size: d.size || null,
    billingLine1: d.billing_line1 || null,
    billingLine2: d.billing_line2 || null,
    billingCity: d.billing_city || null,
    billingPostcode: d.billing_postcode || null,
    billingCountry: d.billing_country || null,
  };

  if (d.id) {
    await getDb().update(schema.organisations).set(values).where(eq(schema.organisations.id, d.id));
    await audit(owner.id, "organisation.update", "organisations", d.id, { name: d.name });
    refresh();
    return { ok: true, message: "Company saved." };
  }

  const [created] = await getDb()
    .insert(schema.organisations)
    .values(values)
    .returning({ id: schema.organisations.id });
  await audit(owner.id, "organisation.create", "organisations", created.id, { name: d.name });
  refresh();
  redirect(`/companies/${created.id}`);
}

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

const PersonSchema = z.object({
  person_id: z.uuid(),
  type: z.enum(schema.personType.enumValues),
  organisation_id: z.uuid().nullable(),
  title: z.string().trim().max(40).nullable(),
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().max(40).nullable(),
  job_title: z.string().trim().max(120).nullable(),
  country: z.string().trim().max(80).nullable(),
  preferred_timezone: z.string().trim().max(80).nullable(),
  linkedin_url: z.url("Enter a valid LinkedIn URL").nullable(),
  date_of_birth: z.iso.date().nullable(),
  headline: z.string().trim().max(160).nullable(),
  summary: z.string().trim().max(4000).nullable(),
  primary_role: z.enum(schema.resourceRole.enumValues).nullable(),
  years_experience: z.coerce.number().int().min(0).max(60).nullable(),
  day_rate: z.coerce.number().min(0).max(100000).nullable(),
  currency: z.enum(["GBP", "EUR", "USD"]),
  available_from: z.iso.date().nullable(),
  open_to_remote: z.boolean(),
});

export async function savePerson(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const keys = Object.keys(PersonSchema.shape).filter((k) => k !== "open_to_remote");
  const raw = Object.fromEntries(keys.map((k) => [k, optional(formData.get(k))]));
  const parsed = PersonSchema.safeParse({
    ...raw,
    currency: raw.currency ?? "GBP",
    open_to_remote: formData.get("open_to_remote") === "on",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue?.path.join(".").replaceAll("_", " ") || "Field"}: ${issue?.message}` };
  }
  const d = parsed.data;
  const industryIds = formData.getAll("industries").map(String);
  const db = getDb();

  const profile = await db.query.resourceProfiles.findFirst({
    where: eq(schema.resourceProfiles.personId, d.person_id),
  });

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(schema.people)
        .set({
          type: d.type,
          organisationId: d.organisation_id,
          title: d.title,
          firstName: d.first_name,
          lastName: d.last_name,
          email: d.email,
          phone: d.phone,
          jobTitle: d.job_title,
          country: d.country,
          preferredTimezone: d.preferred_timezone,
          linkedinUrl: d.linkedin_url,
          dateOfBirth: d.date_of_birth,
        })
        .where(eq(schema.people.id, d.person_id));

      await tx
        .update(schema.users)
        .set({ email: d.email, organisationId: d.organisation_id })
        .where(eq(schema.users.personId, d.person_id));

      if (profile) {
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
            openToRemote: d.open_to_remote,
          })
          .where(eq(schema.resourceProfiles.personId, d.person_id));
      }

      await tx.delete(schema.personIndustries).where(eq(schema.personIndustries.personId, d.person_id));
      if (industryIds.length) {
        await tx
          .insert(schema.personIndustries)
          .values(industryIds.map((industryId) => ({ personId: d.person_id, industryId })));
      }
    });
  } catch {
    return { error: "Could not save. Check the email is not already used by another login." };
  }

  await audit(owner.id, "person.update", "people", d.person_id, { name: `${d.first_name} ${d.last_name}` });
  refresh();
  return { ok: true, message: "Record saved." };
}

export async function createResourceProfile(formData: FormData) {
  const owner = await requireOwner();
  const personId = z.uuid().parse(formData.get("person_id"));
  await getDb().insert(schema.resourceProfiles).values({ personId }).onConflictDoNothing();
  await audit(owner.id, "profile.create", "people", personId);
  refresh();
}

async function personIdFrom(formData: FormData) {
  await requireOwner();
  return z.uuid().parse(formData.get("person_id"));
}

export async function addSkill(formData: FormData) {
  const personId = await personIdFrom(formData);
  const parsed = z
    .object({ skill_id: z.uuid(), level: z.enum(schema.skillLevel.enumValues) })
    .safeParse({ skill_id: formData.get("skill_id"), level: formData.get("level") });
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
  const personId = await personIdFrom(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb()
    .delete(schema.assignedSkills)
    .where(and(eq(schema.assignedSkills.id, id), eq(schema.assignedSkills.personId, personId)));
  refresh();
}

export async function addCertification(formData: FormData) {
  const personId = await personIdFrom(formData);
  const parsed = z
    .object({
      certification_id: z.uuid(),
      achieved_on: z.iso.date().nullable(),
      credential_url: z.url().nullable(),
    })
    .safeParse({
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
  const personId = await personIdFrom(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb()
    .delete(schema.resourceCertifications)
    .where(and(eq(schema.resourceCertifications.id, id), eq(schema.resourceCertifications.personId, personId)));
  refresh();
}

export async function addExperience(_: FormState, formData: FormData): Promise<FormState> {
  const personId = await personIdFrom(formData);
  const parsed = z
    .object({
      job_title: z.string().trim().min(1, "Job title is required").max(160),
      company_name: z.string().trim().max(160).nullable(),
      start_date: z.iso.date("Start date is required"),
      end_date: z.iso.date().nullable(),
      industry_id: z.uuid().nullable(),
      project_description: z.string().trim().max(4000).nullable(),
    })
    .safeParse({
      job_title: optional(formData.get("job_title")),
      company_name: optional(formData.get("company_name")),
      start_date: optional(formData.get("start_date")),
      end_date: optional(formData.get("end_date")),
      industry_id: optional(formData.get("industry_id")),
      project_description: optional(formData.get("project_description")),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
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
  const personId = await personIdFrom(formData);
  const id = z.uuid().parse(formData.get("id"));
  await getDb()
    .delete(schema.workExperiences)
    .where(and(eq(schema.workExperiences.id, id), eq(schema.workExperiences.personId, personId)));
  refresh();
}

// ---------------------------------------------------------------------------
// Projects & requests
// ---------------------------------------------------------------------------

export async function saveProject(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const parsed = z
    .object({
      id: z.union([blank, z.uuid()]),
      organisation_id: z.uuid("Choose a company"),
      name: z.string().trim().min(1, "Project name is required").max(160),
      description: z.string().trim().max(4000),
      start_date: z.union([blank, z.iso.date()]),
      duration_weeks: z.union([blank, z.coerce.number().int().min(1).max(260)]),
    })
    .safeParse({
      id: optional(formData.get("id")) ?? "",
      organisation_id: formData.get("organisation_id"),
      name: formData.get("name"),
      description: optional(formData.get("description")) ?? "",
      start_date: optional(formData.get("start_date")) ?? "",
      duration_weeks: optional(formData.get("duration_weeks")) ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  const industryIds = formData.getAll("industries").map(String);
  const values = {
    organisationId: d.organisation_id,
    name: d.name,
    description: d.description || null,
    startDate: d.start_date || null,
    durationWeeks: d.duration_weeks === "" ? null : d.duration_weeks,
  };

  const db = getDb();
  const id = await db.transaction(async (tx) => {
    const projectId = d.id
      ? d.id
      : (
          await tx
            .insert(schema.projects)
            .values({ ...values, createdByUserId: owner.id })
            .returning({ id: schema.projects.id })
        )[0].id;
    if (d.id) await tx.update(schema.projects).set(values).where(eq(schema.projects.id, projectId));
    await tx.delete(schema.projectIndustries).where(eq(schema.projectIndustries.projectId, projectId));
    if (industryIds.length) {
      await tx
        .insert(schema.projectIndustries)
        .values(industryIds.map((industryId) => ({ projectId, industryId })));
    }
    return projectId;
  });

  await audit(owner.id, d.id ? "project.update" : "project.create", "projects", id, { name: d.name });
  refresh();
  if (!d.id) redirect(`/projects/${id}`);
  return { ok: true, message: "Project saved." };
}

export async function saveRequest(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const parsed = z
    .object({
      id: z.uuid(),
      project_id: z.union([blank, z.uuid()]),
      role_required: z.enum(schema.resourceRole.enumValues),
      status: z.enum(schema.requestStatus.enumValues),
      description: z.string().trim().max(4000),
      start_date: z.union([blank, z.iso.date()]),
      end_date: z.union([blank, z.iso.date()]),
      daily_hours_required: z.union([blank, z.coerce.number().min(1).max(12)]),
    })
    .safeParse({
      id: formData.get("id"),
      project_id: optional(formData.get("project_id")) ?? "",
      role_required: formData.get("role_required"),
      status: formData.get("status"),
      description: optional(formData.get("description")) ?? "",
      start_date: optional(formData.get("start_date")) ?? "",
      end_date: optional(formData.get("end_date")) ?? "",
      daily_hours_required: optional(formData.get("daily_hours_required")) ?? "",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  if (d.start_date && d.end_date && d.end_date < d.start_date) return { error: "End date must be after start date." };

  await getDb()
    .update(schema.resourceRequests)
    .set({
      projectId: d.project_id || null,
      roleRequired: d.role_required,
      status: d.status,
      description: d.description || null,
      startDate: d.start_date || null,
      endDate: d.end_date || null,
      dailyHoursRequired: d.daily_hours_required === "" ? null : d.daily_hours_required.toString(),
    })
    .where(eq(schema.resourceRequests.id, d.id));
  await audit(owner.id, "request.update", "resource_requests", d.id, { status: d.status });
  refresh();
  return { ok: true, message: "Request saved." };
}

export async function addSkillRequirement(formData: FormData) {
  await requireOwner();
  const parsed = z
    .object({ resource_request_id: z.uuid(), skill_id: z.uuid(), level: z.enum(schema.skillLevel.enumValues) })
    .safeParse({
      resource_request_id: formData.get("resource_request_id"),
      skill_id: formData.get("skill_id"),
      level: formData.get("level"),
    });
  if (!parsed.success) return;
  await getDb()
    .insert(schema.skillRequirements)
    .values({
      resourceRequestId: parsed.data.resource_request_id,
      skillId: parsed.data.skill_id,
      level: parsed.data.level,
    })
    .onConflictDoUpdate({
      target: [schema.skillRequirements.resourceRequestId, schema.skillRequirements.skillId],
      set: { level: parsed.data.level },
    });
  refresh();
}

export async function removeSkillRequirement(formData: FormData) {
  await requireOwner();
  const id = z.uuid().parse(formData.get("id"));
  await getDb().delete(schema.skillRequirements).where(eq(schema.skillRequirements.id, id));
  refresh();
}

export async function addShortlist(formData: FormData) {
  const owner = await requireOwner();
  const parsed = z
    .object({
      resource_request_id: z.uuid(),
      project_id: z.union([blank, z.uuid()]),
      person_id: z.uuid(),
      description: z.string().trim().max(2000),
    })
    .safeParse({
      resource_request_id: formData.get("resource_request_id"),
      project_id: optional(formData.get("project_id")) ?? "",
      person_id: formData.get("person_id"),
      description: optional(formData.get("description")) ?? "",
    });
  if (!parsed.success) return;
  const [row] = await getDb()
    .insert(schema.shortlistedResources)
    .values({
      resourceRequestId: parsed.data.resource_request_id,
      projectId: parsed.data.project_id || null,
      personId: parsed.data.person_id,
      description: parsed.data.description || null,
    })
    .returning({ id: schema.shortlistedResources.id });
  await audit(owner.id, "shortlist.add", "shortlisted_resources", row.id, { requestId: parsed.data.resource_request_id });
  refresh();
}

export async function setShortlistStatus(formData: FormData) {
  const owner = await requireOwner();
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.shortlistStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.shortlistedResources).set({ status }).where(eq(schema.shortlistedResources.id, id));
  await audit(owner.id, "shortlist.status", "shortlisted_resources", id, { status });
  refresh();
}

export async function assignResource(formData: FormData) {
  const owner = await requireOwner();
  const parsed = z
    .object({
      person_id: z.uuid(),
      project_id: z.union([blank, z.uuid()]),
      resource_request_id: z.union([blank, z.uuid()]),
      shortlist_id: z.union([blank, z.uuid()]),
      start_date: z.union([blank, z.iso.date()]),
      end_date: z.union([blank, z.iso.date()]),
    })
    .safeParse({
      person_id: formData.get("person_id"),
      project_id: optional(formData.get("project_id")) ?? "",
      resource_request_id: optional(formData.get("resource_request_id")) ?? "",
      shortlist_id: optional(formData.get("shortlist_id")) ?? "",
      start_date: optional(formData.get("start_date")) ?? "",
      end_date: optional(formData.get("end_date")) ?? "",
    });
  if (!parsed.success) return;
  const d = parsed.data;
  await getDb().transaction(async (tx) => {
    await tx.insert(schema.assignedResources).values({
      personId: d.person_id,
      projectId: d.project_id || null,
      resourceRequestId: d.resource_request_id || null,
      startDate: d.start_date || null,
      endDate: d.end_date || null,
    });
    if (d.shortlist_id) {
      await tx
        .update(schema.shortlistedResources)
        .set({ status: "selected" })
        .where(eq(schema.shortlistedResources.id, d.shortlist_id));
    }
    if (d.resource_request_id) {
      await tx
        .update(schema.resourceRequests)
        .set({ status: "fulfilled" })
        .where(eq(schema.resourceRequests.id, d.resource_request_id));
    }
  });
  await audit(owner.id, "assignment.create", "assigned_resources", undefined, { personId: d.person_id });
  refresh();
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const REFERENCE_TABLES = {
  skill: schema.skills,
  industry: schema.industries,
  certification: schema.certifications,
};

const ReferenceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("skill"),
    name: z.string().trim().min(1).max(120),
    category: z.string().trim().max(80).nullable(),
  }),
  z.object({ kind: z.literal("industry"), name: z.string().trim().min(1).max(120) }),
  z.object({
    kind: z.literal("certification"),
    name: z.string().trim().min(1).max(200),
    issuingBody: z.string().trim().min(1).max(80),
    type: z.enum(schema.certificationType.enumValues),
  }),
]);

export async function addReferenceItem(formData: FormData) {
  const owner = await requireOwner();
  const parsed = ReferenceSchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    category: optional(formData.get("category")),
    issuingBody: optional(formData.get("issuingBody")) ?? "Salesforce",
    type: formData.get("type"),
  });
  if (!parsed.success) return;
  const db = getDb();
  const item = parsed.data;
  if (item.kind === "skill") {
    await db.insert(schema.skills).values({ name: item.name, category: item.category }).onConflictDoNothing();
  } else if (item.kind === "industry") {
    await db.insert(schema.industries).values({ name: item.name }).onConflictDoNothing();
  } else {
    await db
      .insert(schema.certifications)
      .values({ name: item.name, issuingBody: item.issuingBody, type: item.type })
      .onConflictDoNothing();
  }
  await audit(owner.id, "reference.add", item.kind, undefined, { name: item.name });
  refresh();
}

export async function toggleReferenceItem(formData: FormData) {
  const owner = await requireOwner();
  const kind = z.enum(["skill", "industry", "certification"]).parse(formData.get("kind"));
  const id = z.uuid().parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  const table = REFERENCE_TABLES[kind];
  await getDb().update(table).set({ isActive }).where(eq(table.id, id));
  await audit(owner.id, "reference.toggle", kind, id, { isActive });
  refresh();
}

export async function renameReferenceItem(formData: FormData) {
  const owner = await requireOwner();
  const kind = z.enum(["skill", "industry", "certification"]).parse(formData.get("kind"));
  const id = z.uuid().parse(formData.get("id"));
  const name = z.string().trim().min(1).max(200).parse(formData.get("name"));
  const table = REFERENCE_TABLES[kind];
  await getDb().update(table).set({ name }).where(eq(table.id, id));
  await audit(owner.id, "reference.rename", kind, id, { name });
  refresh();
}
