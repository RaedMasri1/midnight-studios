# Dependency status — version 0.3.1

Checked October 11, 2026.

## Framework security update

`next`, `eslint-config-next`, and the corresponding Next.js compiler packages are updated from 16.3.4 to 16.3.8. This is a patch update within the same release line. Both the critical `next/og` advisory and the later framework advisories identified by the original audit are outside the updated version's affected ranges.

- Production dependency audit: **0 vulnerabilities** (`npm audit --omit=dev`).
- Full audit: **5 high findings**, **0 critical findings**.

The complete audit outputs are included as `dependency-audit-production.json` and `dependency-audit-all.json`. Audit results can change when advisories are published.

## Remaining development-tool findings

All five high entries trace to this one development dependency chain:

`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces@3.0.3`

The braces advisory GHSA-vfj7-8cjw-p6xm describes denial of service from deeply nested glob patterns. It lists **no patched release** as of this check. These packages are used by local lint tooling and are not installed by `npm ci --omit=dev` or shipped as the static website's server runtime. Treat untrusted projects and lint inputs accordingly. This is an outstanding development dependency issue, not a claim that the full audit is clean.

The automatic audit suggestion downgrades `eslint-config-next` to 14.2.35. We retain the preset matching Next.js 16 and do not force that major downgrade, suppress the advisory, or invent a patched braces version.

## ESLint deprecation notice

ESLint 9 has reached end of life. The current React, JSX accessibility, and import plugins used by the Next.js lint preset declare compatibility through ESLint 9, so an unqualified update to ESLint 10 creates incompatible peer dependencies. This delivery retains the compatible lint stack while that migration remains pending. The notice does not prevent installation, development, or the production export.

## Resolver install-script notice

Newer npm versions record dependency lifecycle-script approvals in `allowScripts`. `unrs-resolver@1.12.2` belongs to the lint import resolver; its postinstall prepares its platform binding. An unreviewed-script notice is not itself a vulnerability finding or a failed install.

No blanket script approval is included. The updated project was installed with lifecycle scripts disabled and its lint command verified in the Linux build environment. Windows-specific binding fallback remains unverified. If a future lint run reports a missing resolver binding, review `npm install-scripts ls` before approving the particular installed package and rebuilding it. Do not approve all dependency scripts merely to remove a warning.

## View the site

From `midnight-studios` in PowerShell, run `npm run dev` and open `http://localhost:3000`. Keep that terminal open. For the included prebuilt export, `npm start` or `Start-Preview.bat` needs only Node.js and no dependency installation.

To use the updated delivery, extract the ZIP into a new folder and run `npm ci`, then `npm run dev`. This preserves any edits in the original extracted folder.

## Verification

The updated production build, TypeScript, exported-page checks, animation/content checks, and bundle budgets pass. `npm run lint` exits successfully with 0 errors and 12 advisory warnings about direct image elements. The mobile menu resets by route key rather than setting state synchronously in an effect. No visual design changes were made for this update. Live browser playback remains unverified in the build environment.

## Sources

- [Next.js 16.3.8 security release](https://github.com/vercel/next.js/releases/tag/v16.3.8)
- [Next.js critical ImageResponse advisory](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j)
- [Braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [ESLint version support](https://eslint.org/version-support/)
- [npm install-script approvals](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/)
