# Homepage and About performance review — 19 October 2026

Baseline: `37aa1a891d106274a0cd17478b8a741c6d6eb894`.

## Focused changes

- Keep Next.js/static export, all original artwork, all 96 Idle Chaos frames,
  page layouts, published content, database schema and publishing flow.
- Supply 480px/800px WebP delivery copies of the five character/sketch assets.
  Originals are unchanged and remain candidates for larger displays. The
  copies are resized from the originals at quality 92 with full alpha quality.
- Prioritize the hero character. Prepare nearby chapters' lazy artwork before
  entry without eagerly downloading all artwork on initial page load.
- Begin reveal animations on intersection instead of constructing paused,
  invisible animations on hydration. Entrance duration is 450ms instead of
  1000–1200ms; the composition is visible throughout the entrance.
- Remove full homepage resets on image load. Observe readable-content size
  instead. Ignore mobile toolbar-only resize events and skip unchanged CSS
  property writes.
- Prepare the Idle Chaos sequence two viewport heights ahead. Keep 12 decoded
  desktop frames or 24 smaller mobile frames; preserve the buffer for quick
  reverse scrolling and release it after 30 seconds away. Obsolete fetches are
  cancelled and cannot re-enter the cache after cancellation. Unchanged canvas
  frames are not redrawn. No complete decoded sequence is held in memory.
- Shorten pinned scroll ranges while keeping their original start/end poses.
  The hero transition's authored timing is unchanged. Other game/studio ranges
  are shorter, including the overriding phone-specific chapter rule.
- Add Cloudflare Pages response headers to prevent framing/clickjacking,
  object embedding and foreign base-URL injection. Retain MIME sniffing and
  referrer protections. No runtime credentials or new services are introduced.

## Measured comparisons

Same local production export, headless Chromium, fresh browser contexts.
390×844, 820×1180 and 1440×900 viewports at device pixel ratio 1:

| Measurement | Before | After |
| --- | ---: | ---: |
| Opening character image | 114,006 bytes | 28,064 bytes (75.4% less) |
| About composition, five images | 576,780 bytes | 136,676 bytes (76.3% less) |
| Homepage initialization CSS property writes | 501 | 256 |
| About initialization CSS property writes | 32 | 16 |
| Idle Chaos pinned travel, desktop | 1,800px | 990px (45% shorter) |
| Idle Chaos pinned travel, tablet | 2,124px | 1,180px (44.4% shorter) |
| Idle Chaos pinned travel, phone | 1,181.6px | 844px (28.6% shorter) |

These are asset, DOM-work and scroll-distance measurements, not claims of a
75% faster whole site or field Core Web Vitals. High-density displays select
larger copies where needed. No network speed or physical-device FPS guarantee
is inferred from local tests. Settled About screenshots were visually inspected;
mean per-channel screenshot differences were below 0.25 on a 0–255 scale.

## Validation

- Production build and TypeScript passed.
- `npm run check` passed: exported routes/links/metadata, release identity,
  media/content/journal schemas, reversible motion, frame-cache checks, all
  192 desktop/mobile frame files and delivery budgets.
- `npm run check:dashboard` passed: actual SQL in isolated PGlite; anonymous
  and outsider denial, draft isolation, admin-only immutable uploads, guarded
  saves/publishing, concurrency checks and service-only review jobs. Edge
  Function/store/hosting requests are mocked, not live account changes.
- Changed TS/TSX files have zero lint errors. Existing image-element warnings
  remain. Full lint retains three pre-existing internal-link errors in the
  unchanged admin dashboard; unrelated dashboard code was not rewritten.
- Chromium tests at phone DPR 3, tablet DPR 2 and desktop DPR 1 passed:
  forward/backward seeks at 0%, 35%, 100%, 50%, 0%, 100% settled at frames
  0, 24, 95, 48, 0, 95 on every viewport; quick return scrolling, resize,
  portrait/landscape changes, reduced-motion fallback, image completion and
  zero JavaScript errors/horizontal overflow.
- Browser test with the configured headers: admin page loads directly and
  iframe embedding is blocked. Cloudflare must apply the exported `_headers`
  file after deployment; local verification does not prove live headers yet.
- Credential-pattern scan found no real secrets or private environment files
  in tracked source. Production dependency audit: zero known vulnerabilities.
  Full audit: five high development-only reports from the unpatched `braces`
  glob dependency chain. The advisory lists no patched version; forcing the
  suggested Next ESLint downgrade is inappropriate for this project.

Live Supabase project settings, account passwords and permissions, actual
Cloudflare preview/production configuration, and physical phones were not
independently audited. No database migration or Edge Function redeployment is
required for this change. Rebuild/deploy the branch to review it, then merge
to publish the tested code.


## Follow-up after the first preview

The first preview did not adequately address the delay in the other game scenes.
This pass compares against that preview, rather than treating the original image
byte savings as a whole-site speed result.

- Just Jump's pinned travel is another 30% shorter on desktop and 35.7% shorter
  on phones. Dreamward, Tadri, Heel and Chaos now use 160svh sections: 40% less
  pinned travel on phones; 36.8–50% less on desktop than the first preview.
- Dreamward and the three upcoming games advance while their artwork enters the
  viewport. At stage arrival they are already 40% through their timeline. The
  cover still opens before the paper layers unfold, and all original authored
  poses remain available when scrolling forward or backward. The first Dreamward
  paper layer starts after about 84px of pinned phone scrolling, previously
  422px. This removes waiting caused by scroll timing, independent of downloads.
- Input smoothing is 28ms instead of 65ms, reducing the extra catch-up after a
  swipe. Hero motion choreography remains unchanged.
- The nearby-art observer preloads and decodes Dreamward, category and player
  sprite sheets before a reveal. Their original CSS rendering, including the
  repeating book texture, is retained. Smaller delivery copies serve DPR-1
  displays; higher densities retain the original sheets. Original images are
  unchanged. A responsive heel-shoe image and removal of the permanently hidden duplicate district prevent wasted bytes.
- Heel fragments and trivia card positions use their original transforms on
  their own elements. Shared animation variables are scoped to their consumers.
  This avoids invalidating every cube face on every animation tick.
- Five Chaos milestone frames are prioritized and protected within the existing
  12/24-frame decoded-memory cap. The final storm remains ready during a rapid
  seek; all 96 frames are still available, and buffers still release offscreen.

Local Chromium production-export tests used gzip responses, a 1.6 Mbps download
limit, 150ms latency, 4× CPU throttling, fresh browser contexts, and 2-second
scripted sweeps of every game. These are lab conditions, not physical-device or
CDN measurements. The earlier uncompressed diagnostic run is not used below.

| Measurement | First preview | Follow-up |
| --- | ---: | ---: |
| Heel style recalculation, phone sweep | 1,192ms | 121ms |
| Heel style recalculation, desktop sweep | 1,172ms | 153ms |
| Tadri style recalculation, phone sweep | 605ms | 284ms |
| Tadri style recalculation, desktop sweep | 673ms | 356ms |
| Phone p95 frame interval, each of five game sweeps | 16.7–33.4ms | 16.7–16.8ms |

Phone test viewport: 390×844 at DPR 3. Desktop: 1440×900 at DPR 1. In this
follow-up run the game image elements and sprite sheets were downloaded before
their tested scene entry; Chaos reached frame 95 after the rapid sweep on both
viewports. Desktop Heel still showed a p95 frame interval around 33ms under
4× CPU throttling. The other four desktop sweeps were around 17ms. Shorter scroll travel and earlier reveals do not guarantee 60fps on
all devices. Initial-load timings are sensitive to request ordering and cache
state and are not presented as a field speed score.


Follow-up validation: production build/TypeScript, full `npm run check`, and
changed-file lint passed (zero errors, three existing image-element warnings).
Phone/tablet/desktop browser tests passed forward/reverse Chaos seeks, resize and
rotation, reduced motion, About image completion, no horizontal overflow, zero
JavaScript errors and the configured anti-framing policy. Visual comparisons of
Dreamward, Tadri and Heel at two matching authored poses across all three
viewports retained their layouts and artwork. CSS sprite rendering was retained
to preserve texture repetition and sharpness; a no-JavaScript browser check also
confirmed the artwork fallback. Original source image files remain unchanged.
