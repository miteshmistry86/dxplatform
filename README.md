# Developer Exchange Platform

Two Next.js apps over one Supabase database:

- **Platform** (this folder): public site, company portal and developer portal.
- **DX Console** (`console/`): the internal management portal, restricted to the DX owners. See [`console/README.md`](console/README.md).

Both apps share the schema in `db/` (an npm workspace package, `@dx/db`).

| Layer | Technology |
|---|---|
| App | Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS v4 |
| Database | Postgres on Supabase, accessed with Drizzle ORM |
| Auth | Supabase Auth (email + password, email confirmation) |
| Hosting | Vercel (app) + Supabase (database, auth); both in an EU region |

## Environments

| Environment | URL | Hosting | Database |
|---|---|---|---|
| Production (live site) | https://dxplatform-ashen.vercel.app | Vercel (`main` branch) | Supabase, Frankfurt |
| DX Console (owners only) | Set when the second Vercel project is created | Vercel (`main`, root `console`) | Same Supabase project |

Use the Production URL for the Supabase Site URL, the `NEXT_PUBLIC_SITE_URL` variable in Vercel, and the auth redirect `https://dxplatform-ashen.vercel.app/auth/callback`.

## Areas

- **Public site:** `/`, `/services`, `/agentic-sdlc`, `/for-developers`, `/about`, `/contact`
- **Company portal:** `/company` (browse masked talent catalogue, request screening/booking, submit resource requests)
- **Developer portal:** `/developer` (build profile: details, skills, certifications, experience; submit for CTA screening)
- **Management:** not in this app. Screening, CRM and reference data live in the DX Console (`console/`).

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
   from Project Settings.
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

5. To manage the data, run the DX Console alongside it: `npm run console:dev` (port 3001).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the platform dev server (port 3000) |
| `npm run console:dev` | Start the DX Console dev server (port 3001) |
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
