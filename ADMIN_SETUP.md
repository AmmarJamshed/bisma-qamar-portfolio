# Admin panel setup (Supabase CMS)

One login for Bisma. **Free tier only** — single user, tiny database, no extra charges if you stay on the free plan.

## Already done for you

| Item | Value |
|------|--------|
| Supabase project | `bisma-portfolio` (Mumbai region) |
| Project URL | `https://gsqxgshphbzywngyvbse.supabase.co` |
| Database schema | Applied |
| Admin user | `bismaqamar` → `bismaqamar@portfolio.admin` |
| Content | Seeded from the live portfolio |
| Live admin | https://bisma-qamar-portfolio.vercel.app/admin/ |

## One manual step (recommended)

In Supabase → **Authentication** → **Providers** → **Email**, turn **OFF** “Enable sign up” so no one else can create an account. Only the admin user should exist.

## If you ever need to reset the password

In PowerShell, from this repo folder:

```powershell
cd "C:\Users\User\.cursor\projects\D-DevStorage-Temp-28b8c347-abcc-442e-8055-bc20e76185aa\bisma-qamar-portfolio"
npm install

$env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_ANON_KEY="your-anon-key"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
$env:ADMIN_PASSWORD="your-chosen-password"
npm run setup:supabase
```

Keys are in Supabase → **Project Settings** → **API**.

The script will:

- Create admin user `bismaqamar@portfolio.admin`
- Seed the site content from the current portfolio
- Write `website/config.js` (anon key only — safe to commit)

**Never commit the service role key or password.**

## 5. Deploy to Vercel

Push to GitHub (or run `npx vercel deploy --prod`). The live site reads content from Supabase.

## How Bisma edits the site

| | |
|---|---|
| **Admin URL** | https://bisma-qamar-portfolio.vercel.app/admin/ |
| **Username** | `bismaqamar` |
| **Password** | The one you set in `ADMIN_PASSWORD` |

Steps: Sign in → edit fields in the sidebar sections → **Save changes** → refresh the public site.

## What she can edit

- Home headline, intro, badges, LinkedIn
- Profile photo (upload in admin)
- Stats numbers and labels
- About text and highlights
- Empowerment quote
- Three role cards
- Publications and timeline
- Contact email and links

Layout and colors stay fixed so the design cannot break.

## Cost control (free tier)

- **1 auth user** only (no public sign-ups)
- **One JSON row** in the database (~few KB)
- **Photo uploads** limited to 5 MB each
- No Edge Functions, no heavy traffic — well within Supabase free limits

## Security notes

- Change the password if it was ever shared in chat or email
- Do not share the `/admin/` link publicly
- Service role key stays on your machine only — never in the website code
