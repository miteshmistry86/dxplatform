import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../schema";
import { CERTIFICATIONS, INDUSTRIES, SKILLS } from "./reference-data";
import { DEMO_RESOURCES } from "./demo-data";

config({ path: [".env.local", ".env"] });

const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_DATABASE_URL or DATABASE_URL must be set");

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client, { schema });

async function seedReferenceData() {
  await db.insert(schema.industries).values(INDUSTRIES.map((name) => ({ name }))).onConflictDoNothing();
  await db.insert(schema.skills).values(SKILLS).onConflictDoNothing();
  await db.insert(schema.certifications).values(CERTIFICATIONS).onConflictDoNothing();
  console.log(
    `Reference data: ${INDUSTRIES.length} industries, ${SKILLS.length} skills, ${CERTIFICATIONS.length} certifications`,
  );
}

async function seedDemoResources() {
  const [skillRows, certRows, industryRows] = await Promise.all([
    db.select().from(schema.skills),
    db.select().from(schema.certifications),
    db.select().from(schema.industries),
  ]);
  const skillId = new Map(skillRows.map((r) => [r.name, r.id]));
  const certId = new Map(certRows.map((r) => [r.name, r.id]));
  const industryId = new Map(industryRows.map((r) => [r.name, r.id]));

  const existing = await db
    .select({ email: schema.people.email })
    .from(schema.people)
    .where(inArray(schema.people.email, DEMO_RESOURCES.map((d) => d.email)));
  const existingEmails = new Set(existing.map((e) => e.email));

  for (const demo of DEMO_RESOURCES) {
    if (existingEmails.has(demo.email)) continue;
    await db.transaction(async (tx) => {
      const [person] = await tx
        .insert(schema.people)
        .values({
          type: "freelancer",
          firstName: demo.firstName,
          lastName: demo.lastName,
          email: demo.email,
          jobTitle: demo.jobTitle,
          country: demo.country,
          preferredTimezone: demo.timezone,
        })
        .returning();

      await tx.insert(schema.resourceProfiles).values({
        personId: person.id,
        status: "listed",
        headline: demo.headline,
        summary: demo.summary,
        primaryRole: demo.role,
        yearsExperience: demo.years,
        availableFrom: demo.availableFrom,
        ctaVetted: true,
        submittedAt: new Date(),
        listedAt: new Date(),
      });

      await tx.insert(schema.assignedSkills).values(
        demo.skills.map(([name, level]) => ({
          personId: person.id,
          skillId: skillId.get(name)!,
          level,
        })),
      );
      await tx.insert(schema.resourceCertifications).values(
        demo.certifications.map((name) => ({ personId: person.id, certificationId: certId.get(name)! })),
      );
      await tx.insert(schema.personIndustries).values(
        demo.industries.map((name) => ({ personId: person.id, industryId: industryId.get(name)! })),
      );
      await tx.insert(schema.workExperiences).values(
        demo.experience.map((e) => ({
          personId: person.id,
          jobTitle: e.jobTitle,
          companyName: e.company,
          startDate: e.start,
          endDate: e.end ?? null,
          industryId: industryId.get(e.industry) ?? null,
          projectDescription: e.description,
        })),
      );
    });
  }
  console.log(`Demo resources: ${DEMO_RESOURCES.length - existingEmails.size} inserted`);
}

async function main() {
  await seedReferenceData();
  if (process.argv.includes("--demo")) await seedDemoResources();
}

main()
  .then(() => client.end())
  .catch(async (err) => {
    console.error(err);
    await client.end();
    process.exit(1);
  });
