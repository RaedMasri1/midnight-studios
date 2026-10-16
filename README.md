# Midnight Studios v0.6.1 — publishing setup and simpler dashboard

For the automatic publishing connection, read [CONNECT-PUBLISHING.md](CONNECT-PUBLISHING.md).

Start with [START-DASHBOARD.md](START-DASHBOARD.md) to connect Supabase Free. The original website and image bytes are preserved. The dashboard code is included; live cloud/store/hosting connections require configuration.

Validation: `npm run build`, `npm run check`, `npm run check:dashboard`. Dashboard database tests use isolated PGlite PostgreSQL; store and Edge Function requests are mocked. See docs/dashboard-verification.json for limits.

---

# Midnight Studios — five worlds

Version 0.5.1 reconnects the homepage character motion and staggered fades on one continuous scroll timeline. The portal/puppy remain framed during the native handoff to Just Jump!, with a downward motion tail and no separately delayed fade. See `docs/revision-051.md` for behavior and verification scope.

The single project ZIP includes original artwork and all website assets. Shared images are stored once under public/assets; the preview launcher automatically prepares the out/assets copy before serving.

## Open the included website on Windows

1. Extract the whole ZIP; open the `Midnight-Studios-v0.5.1` folder.
2. Install Node.js 22.13 or newer if needed.
3. Double-click `Start-Preview.bat`, leave its terminal open, and visit http://localhost:3051.

The ZIP includes a production export in `out/`; previewing it needs no npm install or API key. Do not open `out/index.html` directly. If port 3051 is occupied, run `node scripts/serve-export.mjs --port 3001` and open http://localhost:3001.

## Edit, rebuild and check

Run these commands inside the extracted `Midnight-Studios-v0.5.1` folder in PowerShell or a terminal:

```sh
npm ci
npm run dev
```

Development runs at http://localhost:3000. To rebuild the production export:

```sh
npm run lint
npm run build
npm run check
npm start
```

`npm start` serves the latest `out/` build. Node.js 22.13+ is required; delivery was built with Node.js 24. TypeScript runs during the build. Checks cover eleven application routes, metadata, assets, internal links, original motion, new chapter motion/cache contracts, journal data, CMS/media schemas and mocked store-review adapters. Local-image optimization lint warnings remain.

## Latest visual refinements

The hero uses the client's exact slogan as its main headline. Mobile selects a newly composed portrait of the same cave and portal, with dark space for the logo and copy. Desktop keeps its original environment with stronger shading behind the text. Tadri reserves a player row below the complete moving-card envelope, the About timeline sits higher on phones, and footer links sit farther right with a lower emblem. See `docs/responsive-refinements.md` and `docs/asset-prompts-mobile-hero.md`.

The Journal uses a pale blue-lavender background, visibly distinct from About, with vivid artwork and a shared image-and-copy card on the homepage and Journal index. Each article appears once on the index. Homepage visibility, a preferred featured article and the article limit are validated content settings, ready for a future dashboard.

Just Jump! now has an upright, slimmer puppy rising through smaller platforms. This vertical-ascent concept artwork is used on the Games collection, Journal cards and article page. Original gameplay screenshots remain in the tablet showcase and game gallery. See `docs/journal-refresh.md` for this update and `docs/asset-prompts-journal.md` for the artwork source and prompt.

The preceding update added illustrated Tadri players, improved answer-card geometry, an extended desktop heel background and a stronger Idle Chaos storm. Those refinements remain included; see `docs/feedback-refinements.md` and the included motion preview.

## Three new game chapters

| Game | Scroll sequence | Rendering |
| --- | --- | --- |
| Break the Heel! | Shoe approaches, three block layers fracture in sequence, fragments settle around a pastel district | Separate transparent shoe and district, 24 independently transformed 3D fragments |
| Tadri | Four category tiles orbit a question mark, illustrated players appear, tiles form a shared challenge | Independent icon atlas, CSS depth, native DOM transforms |
| Idle Chaos | Breeze grows into a tornado, debris and roofs lift, lightning and fissures appear | One consistent modeled 3D scene rendered into 96 reversible frames, with a smaller mobile set |

All three have individual game pages, Coming soon labels and concept-art disclosures. No release date or store availability is invented. Client artwork can replace concept artwork later. No Higgsfield tool or service was used; new raster artwork uses OpenAI image generation, and the city sequence uses an included local renderer.

Idle Chaos uses a stylized modeled city rather than the exact painterly buildings of the concept image. Most buildings stay standing; destruction is roofs, fragments, fissures and cliff edges. The sequence preview is `docs/animation-review/idle-chaos-motion.mp4`. It is a source-asset animation, not a recording of browser scrolling.

## Verification and review

Build, TypeScript and automated project checks pass, including Journal visibility, ordering, deduplication, selections from zero to one hundred records and projected Tadri card/player clearance throughout scroll at nine art widths. Browser preview tools were unavailable in this delivery environment, so this revision's browser playback, responsive composition and physical-device performance remain unverified. Earlier supplied screenshots and browser reports in `docs/review/` belong to the previous revision. They do not verify these changes.

Read `docs/three-new-worlds.md` for motion behavior, changed files, review steps and limits. `docs/delivery-audit.md` contains measured build/asset sizes. The full dependency audit retains five high development-tool findings and zero critical findings; the production dependency audit reports zero vulnerabilities on October 15, 2026. No forced dependency upgrades were applied.

## Content and future dashboard

- `content/home.json`: homepage copy, subtitle and upcoming chapter records.
- `content/games.json`: all five games and their individual pages.
- `content/posts.json`: Journal entries, including drafts and publication data.
- `public/assets/`: production images and sequence frames.
- `design-assets/`: editable source artwork and the optional city renderer.

The existing CMS snapshot bridge validates records at build time; a dashboard/backend is not included. Articles can grow without adding frontend code, but a static export requires a rebuild after publishing changes. Chapter layouts and motion stay in frontend components while relevant text/art references remain in content records. See `docs/content-management.md` and `.env.example`.

No secrets or external services are needed to run the website. The renderer's optional Python dependencies are separate from the website. See `docs/idle-chaos-asset-pipeline.md` for regeneration. The included production export allows indexing and uses `https://www.midnightstudios.app` as its canonical origin. Confirm that domain before deployment. Local development stays noindex; private review builds can set `SITE_INDEXABLE=false`. See `docs/public-launch.md`.
