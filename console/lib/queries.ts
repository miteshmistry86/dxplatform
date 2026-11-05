import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@dx/db";

const { assignedSkills, certifications, industries, people, personIndustries, resourceCertifications, resourceProfiles, skills, workExperiences } = schema;

export async function getReferenceData() {
  const db = getDb();
  const [skillRows, certRows, industryRows] = await Promise.all([
    db.select().from(skills).where(eq(skills.isActive, true)).orderBy(asc(skills.name)),
    db.select().from(certifications).where(eq(certifications.isActive, true)).orderBy(asc(certifications.name)),
    db.select().from(industries).where(eq(industries.isActive, true)).orderBy(asc(industries.name)),
  ]);
  return { skills: skillRows, certifications: certRows, industries: industryRows };
}

export function getOrganisationOptions() {
  return getDb()
    .select({ id: schema.organisations.id, name: schema.organisations.name })
    .from(schema.organisations)
    .orderBy(asc(schema.organisations.name));
}

/** Full, unmasked candidate record. */
export async function getCandidate(personId: string) {
  const db = getDb();
  const [person, profile, skillRows, certRows, industryRows, experienceRows] = await Promise.all([
    db.query.people.findFirst({ where: eq(people.id, personId) }),
    db.query.resourceProfiles.findFirst({ where: eq(resourceProfiles.personId, personId) }),
    db
      .select({ id: assignedSkills.id, name: skills.name, level: assignedSkills.level })
      .from(assignedSkills)
      .innerJoin(skills, eq(skills.id, assignedSkills.skillId))
      .where(eq(assignedSkills.personId, personId))
      .orderBy(asc(skills.name)),
    db
      .select({
        id: resourceCertifications.id,
        name: certifications.name,
        achievedOn: resourceCertifications.achievedOn,
      })
      .from(resourceCertifications)
      .innerJoin(certifications, eq(certifications.id, resourceCertifications.certificationId))
      .where(eq(resourceCertifications.personId, personId))
      .orderBy(asc(certifications.name)),
    db
      .select({ id: industries.id, name: industries.name })
      .from(personIndustries)
      .innerJoin(industries, eq(industries.id, personIndustries.industryId))
      .where(eq(personIndustries.personId, personId)),
    db
      .select({
        id: workExperiences.id,
        jobTitle: workExperiences.jobTitle,
        companyName: workExperiences.companyName,
        startDate: workExperiences.startDate,
        endDate: workExperiences.endDate,
        projectDescription: workExperiences.projectDescription,
        industry: industries.name,
      })
      .from(workExperiences)
      .leftJoin(industries, eq(industries.id, workExperiences.industryId))
      .where(eq(workExperiences.personId, personId))
      .orderBy(desc(workExperiences.startDate)),
  ]);
  if (!person) return null;
  return { person, profile, skills: skillRows, certifications: certRows, industries: industryRows, experience: experienceRows };
}

export type Candidate = NonNullable<Awaited<ReturnType<typeof getCandidate>>>;
