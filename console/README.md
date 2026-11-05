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

- Sign-in is a username and password. The username is an email address, and only addresses in `CONSOLE_OWNER_EMAILS`
  are accepted. A wrong username and a wrong password get the same message.
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
| `CONSOLE_OWNER_EMAILS` | Usernames allowed to sign in, comma-separated |
| `CONSOLE_URL` | `http://localhost:3001` locally, the console domain in production |
| `NEXT_PUBLIC_SITE_URL` | The public site, for the "Open public site" link |

## Deploy (second Vercel project)

1. In Vercel, **Add New > Project** and import the same GitHub repository again.
2. Set **Root Directory** to `console`. Framework preset: Next.js. Leave build settings as default.
3. Add the environment variables above. `CONSOLE_OWNER_EMAILS` must include each owner's username.
4. Deploy. Password sign-in does not use an email redirect.
5. Recommended: in the console project's **Settings > Deployment Protection**, turn on Vercel Authentication
   so only members of your Vercel team can even load the sign-in page.
