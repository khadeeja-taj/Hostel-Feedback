# Deploying to Netlify (with Supabase)

This repo has a **Netlify build** of the app (static frontend in `site/` +
serverless functions in `netlify/functions/`) that stores data in **Supabase**.
The original Flask app stays in the repo as a reference.

## 1. Create the database (Supabase)
1. Go to <https://supabase.com> → create a project (free).
2. Open **SQL Editor → New query**, paste the contents of [`db/schema.sql`](db/schema.sql),
   and click **Run**. This creates the `residents` and `submissions` tables.
3. Open **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **service_role** secret key

## 2. Deploy on Netlify
1. Go to <https://app.netlify.com> → **Add new project → Import from GitHub** →
   pick this repo.
2. Build settings (Netlify reads `netlify.toml`, so these are already set):
   - **Publish directory:** `site`
   - **Functions directory:** `netlify/functions`
   - Build command: *(leave empty)*
3. Add **Environment variables** (Site settings → Environment variables):

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_KEY` | your **service_role** key (secret) |
   | `SECRET_KEY` | any long random string |
   | `ADMIN_USERNAME` | admin login username |
   | `ADMIN_PASSWORD` | a strong admin password |

4. Click **Deploy**.

## Notes
- The `service_role` key is used **only inside the functions** (server-side).
  It is never exposed to the browser. Row Level Security is enabled so the
  public anon key cannot read/write the tables.
- **Export** is CSV (opens in Excel). The Flask version's Excel/PDF export is
  not part of the Netlify build.
- To regenerate the static pages after changing templates/CSS, run:
  `python3 - <<'PY'` … (see the build step in the project), or edit the files
  in `site/` directly.
