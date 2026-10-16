# Midnight Studios dashboard · v0.6.1

If you already completed v0.6.0 setup, reuse your database and admin account, copy your local .env.local into this folder, install dependencies, then run npm run cms:pull. The existing migration is already installed. For automatic online publishing, use CONNECT-PUBLISHING.md.

Your existing website and original images are included. No image compression or resizing was applied. The new dashboard is at `/admin`.

## 1. Connect your Supabase Free project

1. Extract this ZIP once into a NEW folder and open that folder in VS Code.
2. In Supabase, open your project’s **Connect** panel. Find the **Project URL** and **Publishable key** (usually starts with `sb_publishable_`). A legacy public `anon` key also works. Never use a secret/service-role key in browser configuration.
3. In the project root, create `.env.local` (next to `package.json`). Paste:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
SITE_URL=http://localhost:3000
SITE_INDEXABLE=false
CMS_PUBLISH_FROM_SUPABASE=false
```

Keep this file local. No passwords need to be shared in chat. The URL and publishable key identify the project; database permissions enforce access.

## 2. Create the database and storage rules

In Supabase, open **SQL Editor → New query**. Copy the complete contents of `supabase/migrations/001_studio_cms.sql` into the editor and run it **once**. It creates private editing records, a public published snapshot, an admin allowlist, review cache, and a public photo bucket with admin-only uploads. It does not alter other project tables.

## 3. Create your admin login

In **Authentication → Users → Add user → Create new user**, create your admin email/password. If offered, use **Auto confirm user** for this manually created account. This is the website admin login, not your Supabase account login and not the database password.

Open a new SQL query and run the following after replacing the email with that admin email:

```sql
insert into public.cms_admins(user_id)
select id from auth.users where lower(email)=lower('YOUR-ADMIN-EMAIL')
on conflict do nothing;
```

Check that one row exists in `cms_admins`. An ordinary authenticated user has no access to drafts or editing. Public signup is not offered by the dashboard. Disable public new-user signup in Supabase Auth settings if this project only serves your studio administrators.

## 4. Open the dashboard

In the VS Code terminal inside the new project folder:

```powershell
npm install
npm run dev
```

Open **http://localhost:3000/admin**. Sign in with the admin login from step 3. Click **Import existing website content** once. This copies the existing five games, journal and homepage settings into Supabase without uploading or modifying the existing image files. Initialization refuses to overwrite an existing workspace.

Email/password sessions are kept in browser memory. Reloading the page requires signing in again. Password recovery/user management is handled through Supabase for this first dashboard release; it is not a public signup system.

## Editing

- **Games:** add/edit/delete or hide games. Drag cards or use arrows to change the Games page order. New pages use the established game-page template. Custom animated homepage scenes keep their approved order and art.
- **Game editor:** edit page text, artwork, icon, screenshots/captions, features, release status, store links/IDs and SEO description. The original icon crop can be retained or removed. Replacing an image removes its old variants/crop and uses the new original file.
- **Journal:** add headings, paragraphs, formatted paragraphs, images, lists, notes, quotes, dividers and investment figures. Reorder sections with arrows. Bold/italic buttons apply to selected text; Preview shows the rendered result. Original paragraph text is preserved. No raw HTML is executed.
- Original image uploads remain inside game artwork, screenshot and journal image editors. The separate Media library page has been removed. Images are kept in storage so previous publications remain valid.
- **Save draft** saves the editing record to Supabase. Choose “Include when publishing” to make a record eligible for the next publication. Merely saving never changes the live website. Preview is a content preview; it does not play every public animation.
- **Publish changes** validates the complete selection, saves a public snapshot and requests a hosting build if the server function/deploy hook is connected. All saved changes are published together. Hiding/deleting a game also omits its existing homepage scene on the next publish. Making a hidden game public again restores its original scene. A published journal must be unlinked from a game before that game can be removed from publication. New games do not automatically receive custom animated scenes.
- **Settings → Content export** downloads saved records and the public snapshot as JSON. This does not include photo files. The database also retains the previous ten publication snapshots; these are content history, not an automatic off-site backup or a one-click restore interface.
- Concurrent edits use revision checks. If another session changes a record, reload before saving; stale changes are refused rather than silently overwriting newer work.

## Publish locally before hosting is connected

After saving and publishing in `/admin`, stop the dev server with Ctrl+C and run:

```powershell
npm run cms:pull
npm run dev
```

This downloads the published snapshot and any new uploaded photos, preserving their bytes. To create an updated static website, run `npm run build` instead of `npm run dev`. A failed content import/build must not be deployed. The included preview is an unconfigured build: add your public configuration and rebuild to enable login in that static preview.

## Online publishing later — Cloudflare Pages Free

No domain access is needed to develop. When hosting is ready:

1. Configure the hosting build command as `npm run build`, output directory `out` and a supported Node 22.13+ runtime.
2. Set the two public Supabase variables in the hosting build environment. Set `CMS_PUBLISH_FROM_SUPABASE=true`. Set `SITE_URL` to the final website origin and `SITE_INDEXABLE=true` only when the public launch is approved.
3. Deploy the included Supabase function using the Supabase CLI: `supabase functions deploy studio-jobs --project-ref YOUR-PROJECT-REF`. The included config disables gateway JWT verification because the function validates user tokens itself with Supabase Auth and checks the admin allowlist. It never accepts a publishable key as admin authorization.
4. Create an official Cloudflare Pages deploy hook (or a Netlify build hook) and save its URL as the function secret `DEPLOY_HOOK_URL` in Supabase. The hook is private; never put it in `NEXT_PUBLIC_` or dashboard records.
5. Publish and confirm the hosting build succeeds. A successful hook request means **build requested**, not “website already updated”. Check your hosting deployment result. Settings includes a retry button for a failed request.

Automatic hook-driven builds generally need a connected source repository/build pipeline. GitHub is not required for local work or manual CLI deployments; we can configure that publishing pipeline when you are ready. Until then, use the local publishing steps above. Nothing in this release registers hosting, pushes to GitHub, connects a domain or purchases services.

## Official store reviews

The included `studio-jobs` function can sync official written reviews, refresh store tokens automatically and request a new build only when cached reviews change. It needs deployment/configuration before the Settings button can work.

In each released game, configure its official store links, Apple app ID and/or Android package name, and mark the relevant store released. Save and publish that game first. In Supabase function secrets, configure only the stores you use:

- Apple: `APPLE_KEY_ID`, `APPLE_ISSUER_ID`, `APPLE_PRIVATE_KEY` (App Store Connect API key with access to your apps).
- Google: `GOOGLE_SERVICE_ACCOUNT_JSON` (complete service-account JSON, authorized in Play Console with Reply to reviews permission).

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are server runtime secrets provided by Supabase. Never add them to the browser environment. Raw store credentials, tokens and deploy hooks are never exposed by the dashboard. No real store imports have been verified against your accounts yet.

For unattended sync, set a random `STUDIO_JOB_SECRET` in function secrets and schedule a POST to `https://YOUR-PROJECT.supabase.co/functions/v1/studio-jobs` every six hours with `Content-Type: application/json`, header `X-Studio-Job-Secret` set to that secret, and body `{"action":"reviews"}`. Use Supabase Cron with `pg_net` and Vault to hold the secret. `supabase/schedule-reviews.sql.example` shows the setup. Do this after released stores and the hosting pipeline work. No schedule is installed automatically.

Google returns written production reviews created/modified in the preceding week. Existing cached history is preserved; older initial history requires a separately normalized Play Console export. Star-only ratings are not returned, historic Google deletions cannot always be reconciled incrementally, and the displayed average covers cached written reviews, not the store-wide rating. Apple retrieves the full paginated set. Visitors still cannot submit reviews through this dashboard implementation.

## Verification and limits

See `docs/dashboard-verification.json` for checks actually run. No customer database credentials were available in the build workspace. Hosted Supabase Auth/storage, deployed Edge Function execution, Cloudflare builds, live stores and device/browser interaction therefore require connection testing. This is working integration code and a setup-ready project, not a claim that your cloud project is already connected.
