CREATE TYPE "public"."certification_type" AS ENUM('admin', 'developer', 'consultant', 'architect', 'marketing', 'commerce', 'industry_cloud', 'designer', 'crm_analytics', 'heroku', 'mulesoft');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-1000', '1001-5000', '5000+');--> statement-breakpoint
CREATE TYPE "public"."contact_request_status" AS ENUM('new', 'responded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."organisation_type" AS ENUM('client_company', 'consulting_partner');--> statement-breakpoint
CREATE TYPE "public"."person_type" AS ENUM('client_contact', 'partner_resource', 'freelancer');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('draft', 'submitted', 'screening', 'listed', 'rejected', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'in_review', 'matching', 'fulfilled', 'closed');--> statement-breakpoint
CREATE TYPE "public"."resource_role" AS ENUM('architect', 'business_analyst', 'developer', 'qa', 'project_manager', 'consultant');--> statement-breakpoint
CREATE TYPE "public"."screening_outcome" AS ENUM('pending', 'call_scheduled', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."shortlist_status" AS ENUM('shortlisted', 'interviewed', 'selected', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."skill_level" AS ENUM('junior', 'middle', 'expert');--> statement-breakpoint
CREATE TYPE "public"."timecard_status" AS ENUM('draft', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'company_user', 'partner_admin', 'developer');--> statement-breakpoint
CREATE TABLE "assigned_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"resource_request_id" uuid,
	"person_id" uuid NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assigned_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"level" "skill_level" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"issuing_body" text DEFAULT 'Salesforce' NOT NULL,
	"type" "certification_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "certifications_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "contact_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"phone" text,
	"interest" text,
	"message" text NOT NULL,
	"status" "contact_request_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assigned_resource_id" uuid,
	"person_id" uuid NOT NULL,
	"organisation_id" uuid,
	"author_user_id" uuid,
	"rating" integer NOT NULL,
	"comments" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "industries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "organisation_type" NOT NULL,
	"name" text NOT NULL,
	"company_email" text,
	"website" text,
	"industry_id" uuid,
	"size" "company_size",
	"billing_line1" text,
	"billing_line2" text,
	"billing_city" text,
	"billing_postcode" text,
	"billing_country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "person_type" NOT NULL,
	"organisation_id" uuid,
	"title" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"job_title" text,
	"date_of_birth" date,
	"country" text,
	"preferred_timezone" text,
	"linkedin_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_industries" (
	"person_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	CONSTRAINT "person_industries_person_id_industry_id_pk" PRIMARY KEY("person_id","industry_id")
);
--> statement-breakpoint
CREATE TABLE "project_industries" (
	"project_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	CONSTRAINT "project_industries_project_id_industry_id_pk" PRIMARY KEY("project_id","industry_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" date,
	"duration_weeks" integer,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"certification_id" uuid NOT NULL,
	"achieved_on" date,
	"credential_url" text
);
--> statement-breakpoint
CREATE TABLE "resource_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"status" "profile_status" DEFAULT 'draft' NOT NULL,
	"headline" text,
	"summary" text,
	"primary_role" "resource_role",
	"years_experience" integer,
	"day_rate" numeric(10, 2),
	"currency" text DEFAULT 'GBP' NOT NULL,
	"available_from" date,
	"open_to_remote" boolean DEFAULT true NOT NULL,
	"cta_vetted" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone,
	"listed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_profiles_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "resource_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"project_id" uuid,
	"requested_by_user_id" uuid,
	"target_person_id" uuid,
	"role_required" "resource_role" NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"daily_hours_required" numeric(4, 1),
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screening_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"reviewer_user_id" uuid,
	"outcome" "screening_outcome" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"call_scheduled_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlisted_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_request_id" uuid NOT NULL,
	"project_id" uuid,
	"person_id" uuid NOT NULL,
	"description" text,
	"status" "shortlist_status" DEFAULT 'shortlisted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_request_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"level" "skill_level" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "timecard_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timecard_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"hours_worked" numeric(4, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "timecards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assigned_resource_id" uuid NOT NULL,
	"project_id" uuid,
	"week_start_date" date NOT NULL,
	"status" timecard_status DEFAULT 'draft' NOT NULL,
	"approved_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	"person_id" uuid,
	"organisation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"job_title" text NOT NULL,
	"company_name" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"industry_id" uuid,
	"project_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assigned_resources" ADD CONSTRAINT "assigned_resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_resources" ADD CONSTRAINT "assigned_resources_resource_request_id_resource_requests_id_fk" FOREIGN KEY ("resource_request_id") REFERENCES "public"."resource_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_resources" ADD CONSTRAINT "assigned_resources_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_skills" ADD CONSTRAINT "assigned_skills_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_skills" ADD CONSTRAINT "assigned_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_assigned_resource_id_assigned_resources_id_fk" FOREIGN KEY ("assigned_resource_id") REFERENCES "public"."assigned_resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_industries" ADD CONSTRAINT "person_industries_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_industries" ADD CONSTRAINT "person_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_industries" ADD CONSTRAINT "project_industries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_industries" ADD CONSTRAINT "project_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_certifications" ADD CONSTRAINT "resource_certifications_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_certifications" ADD CONSTRAINT "resource_certifications_certification_id_certifications_id_fk" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_profiles" ADD CONSTRAINT "resource_profiles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_requests" ADD CONSTRAINT "resource_requests_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_requests" ADD CONSTRAINT "resource_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_requests" ADD CONSTRAINT "resource_requests_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_requests" ADD CONSTRAINT "resource_requests_target_person_id_people_id_fk" FOREIGN KEY ("target_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening_reviews" ADD CONSTRAINT "screening_reviews_profile_id_resource_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."resource_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening_reviews" ADD CONSTRAINT "screening_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlisted_resources" ADD CONSTRAINT "shortlisted_resources_resource_request_id_resource_requests_id_fk" FOREIGN KEY ("resource_request_id") REFERENCES "public"."resource_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlisted_resources" ADD CONSTRAINT "shortlisted_resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlisted_resources" ADD CONSTRAINT "shortlisted_resources_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_requirements" ADD CONSTRAINT "skill_requirements_resource_request_id_resource_requests_id_fk" FOREIGN KEY ("resource_request_id") REFERENCES "public"."resource_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_requirements" ADD CONSTRAINT "skill_requirements_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timecard_entries" ADD CONSTRAINT "timecard_entries_timecard_id_timecards_id_fk" FOREIGN KEY ("timecard_id") REFERENCES "public"."timecards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timecards" ADD CONSTRAINT "timecards_assigned_resource_id_assigned_resources_id_fk" FOREIGN KEY ("assigned_resource_id") REFERENCES "public"."assigned_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timecards" ADD CONSTRAINT "timecards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timecards" ADD CONSTRAINT "timecards_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assigned_skills_person_skill_uq" ON "assigned_skills" USING btree ("person_id","skill_id");--> statement-breakpoint
CREATE INDEX "people_organisation_idx" ON "people" USING btree ("organisation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_certifications_person_cert_uq" ON "resource_certifications" USING btree ("person_id","certification_id");--> statement-breakpoint
CREATE INDEX "resource_profiles_status_idx" ON "resource_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "resource_requests_status_idx" ON "resource_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "screening_reviews_profile_idx" ON "screening_reviews" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_requirements_request_skill_uq" ON "skill_requirements" USING btree ("resource_request_id","skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "timecard_entries_card_date_uq" ON "timecard_entries" USING btree ("timecard_id","work_date");--> statement-breakpoint
CREATE UNIQUE INDEX "timecards_assignment_week_uq" ON "timecards" USING btree ("assigned_resource_id","week_start_date");--> statement-breakpoint
CREATE INDEX "work_experiences_person_idx" ON "work_experiences" USING btree ("person_id");