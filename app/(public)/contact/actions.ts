"use server";

import { z } from "zod";
import { getDb, schema } from "@/db";
import type { FormState } from "@/lib/form";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email"),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  interest: z.enum(["talent", "agentic", "partner", "developer", "other"]).default("other"),
  message: z.string().trim().min(10, "Please tell us a little more").max(5000),
});

const SUCCESS: FormState = {
  ok: true,
  message: "Thanks, we've received your message and will be in touch shortly.",
};

export async function submitContactRequest(_: FormState, formData: FormData): Promise<FormState> {
  // Honeypot field: real users never fill it, so pretend success and drop the submission.
  if (formData.get("website")) return SUCCESS;

  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const data = parsed.data;
  await getDb()
    .insert(schema.contactRequests)
    .values({ ...data, company: data.company || null, phone: data.phone || null });

  return SUCCESS;
}
