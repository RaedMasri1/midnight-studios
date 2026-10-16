# v0.6.0 dashboard integration

Added /admin with Supabase password login, admin allowlist, games CRUD and ordering, game-page/content/store/SEO editors, original photo uploads, journal section editor and previews, staged publication, content export and explicit connection states.

Included guarded PostgreSQL RPCs, private editing records, immutable photo uploads, revision checks, separate public snapshots, ten publication-history snapshots, original homepage scene configuration, store cache and server-job authorization. Hiding a game hides its matching homepage scene while preserving configuration for restoration. New game listings use the existing template; custom homepage animation requires separate art work.

Added Supabase published-snapshot import and original-image download, optional hosting prebuild integration, a server-only official-store synchronization/deploy job and an optional Cron template. None of these external services is automatically configured or claimed live.

Retained static public rendering and the original homepage animation. Admin-only entry code is excluded from the public website script budget. All 291 public files and 25 design assets match v0.5.1 byte for byte. No image compression was performed.

See dashboard-verification.json and START-DASHBOARD.md for checks and connection steps.
