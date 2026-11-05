-- Masked, company-facing view of listed resources.
-- Exposes first name + last initial only; never email, phone, DOB or full surname.
CREATE VIEW "public_talent_profiles" AS
SELECT
  rp.id,
  rp.person_id,
  p.first_name || ' ' || left(p.last_name, 1) || '.' AS display_name,
  rp.headline,
  rp.summary,
  rp.primary_role,
  rp.years_experience,
  rp.available_from,
  rp.open_to_remote,
  rp.cta_vetted,
  rp.listed_at,
  p.job_title,
  p.country,
  p.preferred_timezone,
  coalesce((
    SELECT jsonb_agg(jsonb_build_object('name', s.name, 'level', a.level) ORDER BY s.name)
    FROM assigned_skills a JOIN skills s ON s.id = a.skill_id
    WHERE a.person_id = p.id
  ), '[]'::jsonb) AS skills,
  coalesce((
    SELECT array_agg(c.name ORDER BY c.name)
    FROM resource_certifications rc JOIN certifications c ON c.id = rc.certification_id
    WHERE rc.person_id = p.id
  ), '{}') AS certifications,
  coalesce((
    SELECT array_agg(i.name ORDER BY i.name)
    FROM person_industries pi JOIN industries i ON i.id = pi.industry_id
    WHERE pi.person_id = p.id
  ), '{}') AS industries,
  (
    setweight(to_tsvector('english', coalesce(rp.headline, '') || ' ' || coalesce(p.job_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce((
      SELECT string_agg(s.name, ' ') FROM assigned_skills a JOIN skills s ON s.id = a.skill_id WHERE a.person_id = p.id
    ), '') || ' ' || coalesce((
      SELECT string_agg(c.name, ' ') FROM resource_certifications rc JOIN certifications c ON c.id = rc.certification_id WHERE rc.person_id = p.id
    ), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(rp.summary, '') || ' ' || coalesce((
      SELECT string_agg(coalesce(w.job_title, '') || ' ' || coalesce(w.project_description, ''), ' ')
      FROM work_experiences w WHERE w.person_id = p.id
    ), '')), 'C')
  ) AS search_document
FROM resource_profiles rp
JOIN people p ON p.id = rp.person_id
WHERE rp.status = 'listed';
--> statement-breakpoint

-- The app reads and writes through a server-side Postgres connection. Lock the
-- Supabase Data API (anon / authenticated roles) out of every table and view.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated';
  END IF;
END $$;
