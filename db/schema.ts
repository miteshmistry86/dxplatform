import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  pgView,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums (picklists from the DX Digital Workbook "Data Sheet")
// ---------------------------------------------------------------------------

export const organisationType = pgEnum("organisation_type", [
  "client_company",
  "consulting_partner",
]);

export const personType = pgEnum("person_type", [
  "client_contact",
  "partner_resource",
  "freelancer",
]);

export const userRole = pgEnum("user_role", [
  "admin",
  "company_user",
  "partner_admin",
  "developer",
]);

export const skillLevel = pgEnum("skill_level", ["junior", "middle", "expert"]);

export const resourceRole = pgEnum("resource_role", [
  "architect",
  "business_analyst",
  "developer",
  "qa",
  "project_manager",
  "consultant",
]);

export const certificationType = pgEnum("certification_type", [
  "admin",
  "developer",
  "consultant",
  "architect",
  "marketing",
  "commerce",
  "industry_cloud",
  "designer",
  "crm_analytics",
  "heroku",
  "mulesoft",
]);

export const companySize = pgEnum("company_size", [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1001-5000",
  "5000+",
]);

export const profileStatus = pgEnum("profile_status", [
  "draft",
  "submitted",
  "screening",
  "listed",
  "rejected",
  "inactive",
]);

export const screeningOutcome = pgEnum("screening_outcome", [
  "pending",
  "call_scheduled",
  "approved",
  "rejected",
]);

export const requestStatus = pgEnum("request_status", [
  "new",
  "in_review",
  "matching",
  "fulfilled",
  "closed",
]);

export const shortlistStatus = pgEnum("shortlist_status", [
  "shortlisted",
  "interviewed",
  "selected",
  "rejected",
]);

export const timecardStatus = pgEnum("timecard_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
]);

export const contactRequestStatus = pgEnum("contact_request_status", [
  "new",
  "responded",
  "closed",
]);

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const industries = pgTable("industries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  category: text("category"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  issuingBody: text("issuing_body").notNull().default("Salesforce"),
  type: certificationType("type").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// ---------------------------------------------------------------------------
// Organisations & people (Account / Contact in the workbook)
// ---------------------------------------------------------------------------

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: organisationType("type").notNull(),
  name: text("name").notNull(),
  companyEmail: text("company_email"),
  website: text("website"),
  industryId: uuid("industry_id").references(() => industries.id),
  size: companySize("size"),
  billingLine1: text("billing_line1"),
  billingLine2: text("billing_line2"),
  billingCity: text("billing_city"),
  billingPostcode: text("billing_postcode"),
  billingCountry: text("billing_country"),
  ...timestamps,
});

export const people = pgTable(
  "people",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: personType("type").notNull(),
    organisationId: uuid("organisation_id").references(() => organisations.id, {
      onDelete: "set null",
    }),
    title: text("title"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    jobTitle: text("job_title"),
    dateOfBirth: date("date_of_birth"),
    country: text("country"),
    preferredTimezone: text("preferred_timezone"),
    linkedinUrl: text("linkedin_url"),
    ...timestamps,
  },
  (t) => [index("people_organisation_idx").on(t.organisationId)],
);

/** Application user, 1:1 with Supabase `auth.users` (same id). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull(),
  personId: uuid("person_id").references(() => people.id, { onDelete: "set null" }),
  organisationId: uuid("organisation_id").references(() => organisations.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const personIndustries = pgTable(
  "person_industries",
  {
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    industryId: uuid("industry_id")
      .notNull()
      .references(() => industries.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.personId, t.industryId] })],
);

// ---------------------------------------------------------------------------
// Resource profile, skills, certifications, experience
// ---------------------------------------------------------------------------

export const resourceProfiles = pgTable(
  "resource_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .unique()
      .references(() => people.id, { onDelete: "cascade" }),
    status: profileStatus("status").notNull().default("draft"),
    headline: text("headline"),
    summary: text("summary"),
    primaryRole: resourceRole("primary_role"),
    yearsExperience: integer("years_experience"),
    dayRate: numeric("day_rate", { precision: 10, scale: 2 }),
    currency: text("currency").default("GBP").notNull(),
    availableFrom: date("available_from"),
    openToRemote: boolean("open_to_remote").default(true).notNull(),
    ctaVetted: boolean("cta_vetted").default(false).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    listedAt: timestamp("listed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("resource_profiles_status_idx").on(t.status)],
);

export const assignedSkills = pgTable(
  "assigned_skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: skillLevel("level").notNull(),
  },
  (t) => [uniqueIndex("assigned_skills_person_skill_uq").on(t.personId, t.skillId)],
);

export const resourceCertifications = pgTable(
  "resource_certifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    certificationId: uuid("certification_id")
      .notNull()
      .references(() => certifications.id, { onDelete: "cascade" }),
    achievedOn: date("achieved_on"),
    credentialUrl: text("credential_url"),
  },
  (t) => [
    uniqueIndex("resource_certifications_person_cert_uq").on(t.personId, t.certificationId),
  ],
);

export const workExperiences = pgTable(
  "work_experiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    jobTitle: text("job_title").notNull(),
    companyName: text("company_name"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    industryId: uuid("industry_id").references(() => industries.id),
    projectDescription: text("project_description"),
    ...timestamps,
  },
  (t) => [index("work_experiences_person_idx").on(t.personId)],
);

/** CTA-led vetting of a resource profile before it is listed. */
export const screeningReviews = pgTable(
  "screening_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => resourceProfiles.id, { onDelete: "cascade" }),
    reviewerUserId: uuid("reviewer_user_id").references(() => users.id),
    outcome: screeningOutcome("outcome").notNull().default("pending"),
    notes: text("notes"),
    callScheduledAt: timestamp("call_scheduled_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("screening_reviews_profile_idx").on(t.profileId)],
);

// ---------------------------------------------------------------------------
// Demand side: projects, requests, shortlists, assignments
// ---------------------------------------------------------------------------

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date"),
  durationWeeks: integer("duration_weeks"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  ...timestamps,
});

export const projectIndustries = pgTable(
  "project_industries",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    industryId: uuid("industry_id")
      .notNull()
      .references(() => industries.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.industryId] })],
);

export const resourceRequests = pgTable(
  "resource_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    requestedByUserId: uuid("requested_by_user_id").references(() => users.id),
    /** Set when the company asked to screen / book a specific listed resource. */
    targetPersonId: uuid("target_person_id").references(() => people.id, {
      onDelete: "set null",
    }),
    roleRequired: resourceRole("role_required").notNull(),
    description: text("description"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    dailyHoursRequired: numeric("daily_hours_required", { precision: 4, scale: 1 }),
    status: requestStatus("status").notNull().default("new"),
    ...timestamps,
  },
  (t) => [index("resource_requests_status_idx").on(t.status)],
);

export const skillRequirements = pgTable(
  "skill_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resourceRequestId: uuid("resource_request_id")
      .notNull()
      .references(() => resourceRequests.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: skillLevel("level").notNull(),
  },
  (t) => [
    uniqueIndex("skill_requirements_request_skill_uq").on(t.resourceRequestId, t.skillId),
  ],
);

export const shortlistedResources = pgTable("shortlisted_resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  resourceRequestId: uuid("resource_request_id")
    .notNull()
    .references(() => resourceRequests.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  description: text("description"),
  status: shortlistStatus("status").notNull().default("shortlisted"),
  ...timestamps,
});

export const assignedResources = pgTable("assigned_resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  resourceRequestId: uuid("resource_request_id").references(() => resourceRequests.id, {
    onDelete: "set null",
  }),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Time entry (Phase 3) & feedback
// ---------------------------------------------------------------------------

export const timecards = pgTable(
  "timecards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignedResourceId: uuid("assigned_resource_id")
      .notNull()
      .references(() => assignedResources.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    weekStartDate: date("week_start_date").notNull(),
    status: timecardStatus("status").notNull().default("draft"),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
    ...timestamps,
  },
  (t) => [uniqueIndex("timecards_assignment_week_uq").on(t.assignedResourceId, t.weekStartDate)],
);

export const timecardEntries = pgTable(
  "timecard_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timecardId: uuid("timecard_id")
      .notNull()
      .references(() => timecards.id, { onDelete: "cascade" }),
    workDate: date("work_date").notNull(),
    hoursWorked: numeric("hours_worked", { precision: 4, scale: 2 }).notNull(),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("timecard_entries_card_date_uq").on(t.timecardId, t.workDate)],
);

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignedResourceId: uuid("assigned_resource_id").references(() => assignedResources.id, {
    onDelete: "set null",
  }),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  organisationId: uuid("organisation_id").references(() => organisations.id, {
    onDelete: "set null",
  }),
  authorUserId: uuid("author_user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  comments: text("comments"),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------

export const contactRequests = pgTable("contact_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  interest: text("interest"),
  message: text("message").notNull(),
  status: contactRequestStatus("status").notNull().default("new"),
  ...timestamps,
});

/** Masked view defined in migration 0001; the only source companies query. */
export const publicTalentProfiles = pgView("public_talent_profiles", {
  id: uuid("id").notNull(),
  personId: uuid("person_id").notNull(),
  displayName: text("display_name").notNull(),
  headline: text("headline"),
  summary: text("summary"),
  primaryRole: resourceRole("primary_role"),
  yearsExperience: integer("years_experience"),
  availableFrom: date("available_from"),
  openToRemote: boolean("open_to_remote").notNull(),
  ctaVetted: boolean("cta_vetted").notNull(),
  listedAt: timestamp("listed_at", { withTimezone: true }),
  jobTitle: text("job_title"),
  country: text("country"),
  preferredTimezone: text("preferred_timezone"),
  skills: jsonb("skills").$type<{ name: string; level: "junior" | "middle" | "expert" }[]>().notNull(),
  certifications: text("certifications").array().notNull(),
  industries: text("industries").array().notNull(),
}).existing();

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: uuid("entity_id"),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
