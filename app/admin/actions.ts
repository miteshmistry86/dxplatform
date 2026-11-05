"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { audit } from "@/lib/audit";
import { requireRole } from "@/lib/auth";
import { optional } from "@/lib/utils";

function refresh() {
  revalidatePath("/admin", "layout");
}

const ScreeningSchema = z.object({
  profile_id: z.uuid(),
  decision: z.enum(["start", "schedule", "approve", "reject"]),
  notes: z.string().trim().max(4000).nullable(),
  call_scheduled_at: z.string().nullable(),
});

const DECISIONS = {
  start: { status: "screening", outcome: "pending" },
  schedule: { status: "screening", outcome: "call_scheduled" },
  approve: { status: "listed", outcome: "approved" },
  reject: { status: "rejected", outcome: "rejected" },
} as const;

export async function recordScreeningDecision(formData: FormData) {
  const admin = await requireRole("admin");
  const parsed = ScreeningSchema.safeParse({
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
      .set({
        status,
        ...(decision === "approve" ? { listedAt: new Date(), ctaVetted: true } : {}),
      })
      .where(eq(schema.resourceProfiles.id, profile_id));

    await tx.insert(schema.screeningReviews).values({
      profileId: profile_id,
      reviewerUserId: admin.id,
      outcome,
      notes,
      callScheduledAt: call_scheduled_at ? new Date(call_scheduled_at) : null,
      decidedAt: final ? new Date() : null,
    });
  });

  await audit(admin.id, `screening.${decision}`, "resource_profiles", profile_id, { notes });
  refresh();
}

export async function setProfileStatus(formData: FormData) {
  const admin = await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.profileStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.resourceProfiles).set({ status }).where(eq(schema.resourceProfiles.id, id));
  await audit(admin.id, "profile.status", "resource_profiles", id, { status });
  refresh();
}

export async function setRequestStatus(formData: FormData) {
  const admin = await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.requestStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.resourceRequests).set({ status }).where(eq(schema.resourceRequests.id, id));
  await audit(admin.id, "request.status", "resource_requests", id, { status });
  refresh();
}

export async function setContactStatus(formData: FormData) {
  const admin = await requireRole("admin");
  const id = z.uuid().parse(formData.get("id"));
  const status = z.enum(schema.contactRequestStatus.enumValues).parse(formData.get("status"));
  await getDb().update(schema.contactRequests).set({ status }).where(eq(schema.contactRequests.id, id));
  await audit(admin.id, "contact.status", "contact_requests", id, { status });
  refresh();
}

const ReferenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("skill"), name: z.string().trim().min(1).max(120), category: z.string().trim().max(80).nullable() }),
  z.object({ kind: z.literal("industry"), name: z.string().trim().min(1).max(120) }),
  z.object({
    kind: z.literal("certification"),
    name: z.string().trim().min(1).max(200),
    issuingBody: z.string().trim().min(1).max(80),
    type: z.enum(schema.certificationType.enumValues),
  }),
]);

export async function addReferenceItem(formData: FormData) {
  const admin = await requireRole("admin");
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
  await audit(admin.id, "reference.add", item.kind, undefined, { name: item.name });
  refresh();
}

export async function toggleReferenceItem(formData: FormData) {
  const admin = await requireRole("admin");
  const kind = z.enum(["skill", "industry", "certification"]).parse(formData.get("kind"));
  const id = z.uuid().parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  const db = getDb();
  const table = { skill: schema.skills, industry: schema.industries, certification: schema.certifications }[kind];
  await db.update(table).set({ isActive }).where(eq(table.id, id));
  await audit(admin.id, "reference.toggle", kind, id, { isActive });
  refresh();
}
