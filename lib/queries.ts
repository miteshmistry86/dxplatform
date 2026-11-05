import "server-only";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";

const {
  assignedSkills,
  certifications,
  industries,
  people,
  personIndustries,
  publicTalentProfiles,
  resourceCertifications,
  resourceProfiles,
  skills,
  workExperiences,
} = schema;

export async function getReferenceData() {
  const db = getDb();
  const [skillRows, certRows, industryRows] = await Promise.all([
    db.select().from(skills).where(eq(skills.isActive, true)).orderBy(asc(skills.name)),
    db.select().from(certifications).where(eq(certifications.isActive, true)).orderBy(asc(certifications.name)),
    db.select().from(industries).where(eq(industries.isActive, true)).orderBy(asc(industries.name)),
  ]);
  return { skills: skillRows, certifications: certRows, industries: industryRows };
}

/** Full, unmasked profile. Only for the owning developer or an admin. */
export async function getFullProfile(personId: string) {
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
        credentialUrl: resourceCertifications.credentialUrl,
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
    getWorkExperience(personId),
  ]);
  if (!person) return null;
  return {
    person,
    profile,
    skills: skillRows,
    certifications: certRows,
    industries: industryRows,
    experience: experienceRows,
  };
}

export type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

export function getWorkExperience(personId: string) {
  return getDb()
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
    .orderBy(desc(workExperiences.startDate));
}

export function profileCompleteness(p: FullProfile) {
  const checks = [
    { label: "Professional summary", done: Boolean(p.profile?.headline && p.profile?.summary && p.profile?.primaryRole) },
    { label: "Location & timezone", done: Boolean(p.person.country && p.person.preferredTimezone) },
    { label: "At least 3 skills", done: p.skills.length >= 3 },
    { label: "At least 1 certification", done: p.certifications.length >= 1 },
    { label: "At least 1 work experience", done: p.experience.length >= 1 },
    { label: "Industry experience", done: p.industries.length >= 1 },
  ];
  return { checks, complete: checks.every((c) => c.done) };
}

export interface TalentFilters {
  q?: string;
  skill?: string;
  role?: string;
  certification?: string;
  industry?: string;
}

/** Company-facing search. Reads only the masked `public_talent_profiles` view. */
export async function searchTalent(filters: TalentFilters) {
  const where: SQL[] = [];
  if (filters.q) {
    where.push(sql`search_document @@ websearch_to_tsquery('english', ${filters.q})`);
  }
  if (filters.skill) {
    where.push(sql`${publicTalentProfiles.skills} @> ${JSON.stringify([{ name: filters.skill }])}::jsonb`);
  }
  if (filters.role) {
    where.push(sql`${publicTalentProfiles.primaryRole} = ${filters.role}`);
  }
  if (filters.certification) {
    where.push(sql`${filters.certification} = ANY(${publicTalentProfiles.certifications})`);
  }
  if (filters.industry) {
    where.push(sql`${filters.industry} = ANY(${publicTalentProfiles.industries})`);
  }

  const order = filters.q
    ? sql`ts_rank(search_document, websearch_to_tsquery('english', ${filters.q})) DESC`
    : sql`${publicTalentProfiles.listedAt} DESC NULLS LAST`;

  return getDb()
    .select()
    .from(publicTalentProfiles)
    .where(where.length ? and(...where) : undefined)
    .orderBy(order)
    .limit(60);
}

export async function getTalentProfile(id: string) {
  const [row] = await getDb()
    .select()
    .from(publicTalentProfiles)
    .where(eq(publicTalentProfiles.id, id))
    .limit(1);
  return row ?? null;
}
