# DX Console

Internal management portal for Developer Exchange. Only the DX owners can sign in. It reads and writes the same
Supabase Postgres database as the public platform, using the shared schema in `../db`.

## What it covers

| Area | Purpose |
|---|---|
| Dashboard | Headline numbers, one "needs attention" inbox of everything new, last-30-day intake, recent activity |
| Screening queue | Submitted candidate profiles, oldest first; approve, reject or log a screening call |
| Resource requests | What companies asked for; set requirements, shortlist, assign talent |
| Contact enquiries | Messages from the public contact form |
| Candidates | Full, unmasked records: details, profile, skills, certifications, experience |
| Companies | Clients and partners, with their people, logins, projects and requests |
| Projects | Engagements that requests and placements belong to |
| Reference data | Skills, industries and certifications picklists |
| Activity log | Every change, with who made it |
| Search | One box across people, companies, requests and enquiries |

## Access control

- Sign-in is by one-time email link. Links are only sent to addresses in `CONSOLE_OWNER_EMAILS`; everyone else
  sees the same "link is on its way" message, so the owner list cannot be probed.
- Every page and server action re-checks the signed-in email against `CONSOLE_OWNER_EMAILS`. Removing an address
  locks that person out on their next request.
- The console uses its own session cookie (`dx-console-auth`), separate from the public site's.
- Pages send `X-Robots-Tag: noindex` and `X-Frame-Options: DENY`.

## Run locally

```bash
# from the repo root (dx-platform)
npm install
npm run console:dev    # http://localhost:3001
```

`console/.env.local` needs (see `.env.example`):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` | Same as the platform |
| `CONSOLE_OWNER_EMAILS` | The three owners' emails, comma-separated |
| `CONSOLE_URL` | `http://localhost:3001` locally, the console domain in production |
| `NEXT_PUBLIC_SITE_URL` | The public site, for the "Open public site" link |

In Supabase, Authentication > URL Configuration > Redirect URLs, add `http://localhost:3001/auth/callback`.
Open the email link in the same browser you requested it from.

## Deploy (second Vercel project)

1. In Vercel, **Add New > Project** and import the same GitHub repository again.
2. Set **Root Directory** to `console`. Framework preset: Next.js. Leave build settings as default.
3. Add the environment variables above, with `CONSOLE_URL` set to the console's Vercel URL.
4. Deploy, then add `https://<console-domain>/auth/callback` to the Supabase redirect URLs.
5. Recommended: in the console project's **Settings > Deployment Protection**, turn on Vercel Authentication
   so only members of your Vercel team can even load the sign-in page.
