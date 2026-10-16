# Connect automatic publishing

This guide completes the setup from v0.6.0. The dashboard stores content in Supabase; a hosting build must then fetch that content and generate the public pages. After this one-time connection, the client uses Publish changes and waits for a successful build. They do not run terminal commands for routine content updates.

## Upgrade your local folder

Extract this project into a new folder. Copy `.env.local` from your working v0.6.0 folder into it. Reuse your existing Supabase project, administrator and database: no new database migration is required. Run `npm install`, then `npm run cms:pull` to load the content you already saved. The standalone Media page is removed; original image uploads remain in the game and journal editors.

## 1. Create the private source repository

Open https://github.com/new using the GitHub account you want to own this project. Choose a name such as `midnight-studios`, select **Private**, and initialize it with a README. This lets the connected GitHub integration populate it in a subsequent commit. Share the repository URL with your development assistant, or use Git/VS Code to upload the source yourself.

The repository should contain the project files directly at its root, with `package.json` at the top. `.gitignore` excludes `.env.local`, other private environment files, `node_modules`, `.next`, `out`, logs and local Supabase state. Retain `.env.example` and the non-secret `.env.production` defaults. All original public and design assets belong in the repository. The ZIP itself does not need to be uploaded as a repository file.

## 2. Create a Git-connected Cloudflare Pages project

Your current `workers.dev` address can remain available for review. In **Workers & Pages → Create application**, select **Continue to Pages** when offered. Choose **Connect to Git / Import an existing Git repository**, authorize access to the chosen private repository, and select it.

Use these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework | Next.js static HTML export, or None with the settings below |
| Build command | `npm run build:cloudflare` |
| Build output directory | `out` |
| Root directory | Leave empty when package.json is at the repository root |
| Node version | 22 (`.node-version` is included) |

In the build environment, add:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your existing HTTPS Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your existing publishable key |
| `SITE_URL` | The HTTPS address assigned to the new Pages project |
| `SITE_INDEXABLE` | `false` during client review |

The custom build command requires these settings and always imports the latest published Supabase content before building. A failed content import or Next.js build must stay failed; Cloudflare should continue serving the previous successful deployment.

If you only learn the exact pages.dev address after the first project setup, set SITE_URL to that assigned address and retry the deployment. Wait for a successful build and verify the homepage, Games, Journal and `/admin`. The domain can be connected later.

## 3. Create a deploy hook

In the **new Pages project**, open **Settings → Builds → Deploy hooks** (sometimes under Builds & deployments). Add a hook named `studio-publish` targeting branch `main`. Save its URL privately. Treat that URL as a secret because a POST to it starts a build.

## 4. Deploy the Supabase publishing function

In VS Code's terminal, from this project's root:

```powershell
npx supabase login
```

Complete Supabase's browser sign-in. Then deploy the included function, substituting the project reference from your Supabase project URL:

```powershell
npx supabase functions deploy studio-jobs --project-ref YOUR-PROJECT-REF
```

`supabase/config.toml` configures `studio-jobs` with gateway JWT checking disabled. The function itself verifies the signed-in user using Supabase Auth and then checks the private admin allowlist; public API keys cannot authorize a publish request.

In **Supabase → Edge Functions → Secrets**, add `DEPLOY_HOOK_URL` with the hook URL from step 3. Keep it out of browser environment variables, GitHub source files and chat. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the server function automatically.

## 5. Verify the complete connection

1. Sign into `/admin` on the new Pages address.
2. Edit a journal, make sure it is included when publishing, and save it.
3. Click Publish changes. The dashboard should say a build was requested.
4. Open Cloudflare's deployment list and confirm a new deployment starts from the hook.
5. Wait for success, then open the public journal page in a new tab. Confirm the exact edited text/image is visible.
6. If a hook request failed after saving, retry the hosting build from dashboard Settings. If the build itself failed, inspect Cloudflare's build log; the old website stays online.

This is the acceptance test for automatic publishing. A Supabase success message alone does not prove deployment. No domain change, new paid plan or store-review credentials are required just to connect content publishing. Existing free-plan usage limits still apply.

For an authorized client login, repeat the admin-user and allowlist instructions in START-DASHBOARD.md with the client's separate email address. Both admins edit the same Supabase content.

Store-review synchronization is a separate connection: use the included server job and store-specific credentials described in START-DASHBOARD.md when released games are available.

References: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/ · https://developers.cloudflare.com/pages/configuration/deploy-hooks/ · https://supabase.com/docs/guides/functions/deploy
