# Cinematic homepage delivery audit

| Asset or code scope | Size | Method |
| --- | --- | --- |
| logo.svg | 7.3 KiB | Stored asset size |
| manrope-latin.woff2 | 22.1 KiB | Stored asset size |
| portal-cave.webp | 155.1 KiB | Stored asset size |
| portal-cave-960.webp | 67.7 KiB | Stored asset size |
| portal-cave-mobile.webp | 128.5 KiB | Stored asset size |
| portal-cave-mobile-480.webp | 52.5 KiB | Stored asset size |
| portal-cave-mobile-700.webp | 87.3 KiB | Stored asset size |
| hero-puppy.webp | 111.3 KiB | Stored asset size |
| dream-cutouts.webp | 398.1 KiB | Stored asset size |
| studio-dog.webp | 184.0 KiB | Stored asset size |
| studio-cat.webp | 158.9 KiB | Stored asset size |
| studio-sketch.webp | 103.5 KiB | Stored asset size |
| studio-tools.webp | 101.9 KiB | Stored asset size |
| studio-floor.webp | 15.0 KiB | Stored asset size |
| just-jump-ascent.webp | 108.7 KiB | Stored asset size |
| just-jump-forest-640.webp | 71.8 KiB | Stored asset size |
| just-jump-crystal-caves-640.webp | 57.4 KiB | Stored asset size |
| heel-shoe.webp | 127.8 KiB | Stored asset size |
| heel-district.webp | 129.1 KiB | Stored asset size |
| heel-district-desktop.webp | 178.1 KiB | Stored asset size |
| trivia-icons.webp | 231.9 KiB | Stored asset size |
| tadri-players.webp | 303.1 KiB | Stored asset size |
| idle-chaos-storm.webp | 68.6 KiB | Stored asset size |
| midnight-studios-social-050.jpg | 172.3 KiB | Stored asset size |
| portal-cave-tablet.webp | 159.5 KiB | Stored asset size |
| portal-cave-tablet-800.webp | 92.8 KiB | Stored asset size |
| just-jump-tablet-forest.webp | 118.3 KiB | Stored asset size |
| just-jump-tablet-forest-480.webp | 37.4 KiB | Stored asset size |
| just-jump-tablet-forest-768.webp | 67.9 KiB | Stored asset size |
| just-jump-tablet-caves.webp | 98.5 KiB | Stored asset size |
| just-jump-tablet-caves-480.webp | 30.3 KiB | Stored asset size |
| just-jump-tablet-caves-768.webp | 54.6 KiB | Stored asset size |
| Idle Chaos desktop sequence | 5270.5 KiB | 96 frames, fetched near the chapter |
| Idle Chaos mobile sequence | 2098.8 KiB | 96 alternative smaller frames |
| Home entry scripts, including legacy polyfill | 204.7 KiB | Scripts referenced in home HTML |
| Home modern entry scripts | 166.1 KiB | Excludes nomodule polyfill |
| Public route scripts combined | 215.5 KiB | Unique scripts referenced by public HTML; excludes admin |
| Admin-only entry scripts | 96.9 KiB | Only loaded at /admin |
| All generated JavaScript | 415.0 KiB | 32 files across all routes |
| All generated CSS | 40.7 KiB | 5 files |

These are gzip estimates and stored asset bytes, not load times, measured FPS or field Core Web Vitals. Home scripts exclude HTML/RSC payloads, images and fonts. All-route JavaScript is not the initial download.

## Verification

The current build passes the production build and TypeScript, exported routes/metadata/internal links, bounded reversible scroll poses, closed-book cutout checks, content/media schemas, journal visibility/deduplication/0–100article selections, mocked store-import adapters and three new world checks. The latter cover fracture timing, projected full-scroll trivia/player clearance across nine art widths, bounded decoded-frame eviction, all 192 sequence files and static fallback markup.

No browser or preview runner was available in the current managed environment. New chapter layout, scroll playback and browser/device performance have not been visually verified in a browser. Earlier supplied browser captures and reports describe the previous revision only. The included Idle Chaos MP4 verifies the rendered source sequence, not the website. No Lighthouse/FPS or physical-device claim is made. See responsive-refinements.md for the current changes and verification scope; journal-refresh.md, feedback-refinements.md and three-new-worlds.md describe earlier updates.

About uses five separate generated assets: a mesh puppy, gray cat, sketch sheet, paper with pencil, and floor. The original reference screenshot is no longer rendered. Dreamward uses a new illustrated atlas with whole cutouts; the Games collection and Journal use corrected vertical-ascent concept art. Portal, studio, journal and Dreamward illustrations are concept assets. Original supplied game screenshots and original logo are retained.

No animation runtime dependency or scroll hijacking was added. Visible chapters update CSS transforms through a passive scroll listener and an on-demand requestAnimationFrame loop. Four isolated Tadri cards also resize their width and height during the final morph to preserve corner radii and text proportions. Idle Chaos seeks a canvas sequence, with three concurrent fetches and at most twelve retained decoded frames. That cap represents approximately 40.3 MiB desktop or 14.5 MiB mobile of RGBA pixel data, excluding browser overhead, canvas storage and other images; it is an estimate, not a browser memory measurement. The full sequence is not decoded at once. Offscreen caches are released, reduced motion uses the poster, and the mobile sequence is selected at widths up to 700px. The lunar surface retains its existing pause/resume control. Short windows, large type and overflowing stages use a normal reading layout.

Budgets: 220 KiB home entry scripts and 320 KiB combined public-route entry JavaScript and 150 KiB admin-only entry JavaScript. Production builds use the public indexing settings in .env.production. Development stays noindex, and private preview builds can set SITE_INDEXABLE=false.
