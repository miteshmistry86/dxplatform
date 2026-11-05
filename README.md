# Developer Exchange Platform

Public site, company portal, developer portal and admin backend for Developer Exchange, in a single Next.js app.

| Layer | Technology |
|---|---|
| App | Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS v4 |
| Database | Postgres on Supabase, accessed with Drizzle ORM |
| Auth | Supabase Auth (email + password, email confirmation) |
| Hosting | Vercel (app) + Supabase (database, auth); both in an EU region |

## Areas

- **Public site:** `/`, `/services`, `/agentic-sdlc`, `/for-developers`, `/about`, `/contact`
- **Company portal:** `/company` (browse masked talent catalogue, request screening/booking, submit resource requests)
- **Developer portal:** `/developer` (build profile: details, skills, certifications, experience; submit for CTA screening)
- **Admin:** `/admin` (screening queue and decisions, developers, companies, requests, contact requests, reference data)

## Data model

`db/schema.ts` implements the objects from *DX Digital Workbook.xlsx*:

- Account → `organisations` (`client_company` / `consulting_partner`)
- Contact → `people` (`client_contact` / `partner_resource` / `freelancer`)
- `resource_profiles`, `assigned_skills`, `resource_certifications`, `work_experiences`, `person_industries`
- `projects`, `resource_requests`, `skill_requirements`, `shortlisted_resources`, `assigned_resources`
- `timecards`, `timecard_entries`, `feedback` (Phase 3)
- Platform tables: `users`, `screening_reviews`, `contact_requests`, `audit_log`

**Name masking:** companies only ever query the `public_talent_profiles` view (migration `0001`), which exposes
first name + last initial and no contact details. Row-level security is enabled on every table and the Supabase
Data API roles (`anon`, `authenticated`) are revoked, so data is only reachable through the app's server code.

## Testing against hosted Supabase

Docker is not required. Day-to-day testing uses a hosted Supabase project (Postgres and Auth), which is the same
shape as production.

1. In the [Supabase dashboard](https://supabase.com/dashboard), create a project in an EU region
   (London `eu-west-2` or Frankfurt `eu-central-1`). Keep the database password; it is shown only once.
2. Copy `.env.example` to `.env.local` and fill in the project URL, anon key and both connection strings
   from Project Settings. Put your email in `ADMIN_EMAILS`.
   - `DATABASE_URL`: Transaction pooler, port `6543`
   - `DIRECT_DATABASE_URL`: Session pooler or direct connection, port `5432` (used by migrations)
3. In Authentication > URL Configuration, set the Site URL to `http://localhost:3000` and add
   `http://localhost:3000/auth/callback` as a redirect URL.
4. Install, migrate and seed:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed            # reference data from the workbook
   npm run db:seed -- --demo  # optional: 6 fictional listed developers
   npm run dev
   ```

5. Register at `/register/developer` with an email listed in `ADMIN_EMAILS`. That account is provisioned as
   an admin on first sign-in and lands on `/admin`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate a migration after editing `db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio (raw data browser) |
| `npm run db:seed` | Seed reference data (`-- --demo` adds demo profiles) |

New tables need RLS enabled in their migration (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

## Deploying

1. Push this folder to GitHub and import it into Vercel (Root Directory: `dx-platform` if the repo root is above it).
2. Set the same environment variables in Vercel, with `NEXT_PUBLIC_SITE_URL` set to the production domain.
3. Set the Vercel function region to `lhr1` (London) or `fra1` (Frankfurt) to sit next to the database.
4. Update the Supabase Auth Site URL and redirect URLs for the production domain.
5. Use a separate Supabase project for staging; Vercel preview deployments can point at it.
