# v0.6.1

Removed the standalone Media page. Original-quality uploads remain in the game and journal editors; no image assets or Supabase records were removed.

Added npm run build:cloudflare, which validates required settings and always imports the current published Supabase snapshot before generating the static website. Added CONNECT-PUBLISHING.md with the Git-connected Pages, deploy-hook and Supabase-function connection steps, and explicit upgrade instructions to reuse existing content and configuration.

Build, TypeScript, website regressions, missing-configuration guard and Git ignore checks passed. Automatic publishing still requires the actual repository and external account configuration; no hosting connection is claimed completed.
