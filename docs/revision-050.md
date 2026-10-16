# Revision 0.5.0

## Changes

- Kept both hero introduction sentences and placed each in its own line container. Long text can still wrap naturally on narrow screens; no forced tiny font or nowrap was added.
- Lowered the phone headline/actions by about 32–56 CSS pixels, depending on viewport height. The new label line increases the introduction's height, so its first line moves down slightly less. Mobile bottom padding is now 112–140px, with a 96px fallback for short screens; the copy remains over the existing dark cave backdrop.
- Corrected the hero-to-Just-Jump handoff on every viewport. Previously the whiteout completed at the end of pinned camera motion, while Just Jump! was still below the viewport. The fade is now driven by native section departure: it stays at zero until the following section has entered 20% of the viewport, then eases as the hero exits. Existing camera/puppy transforms and pin lengths remain. No negative margins, overlaid sections, fixed transition panels or scroll interception were introduced.
- Added the same orange homepage puppy to the approved social card's bright portal. Updated Open Graph/Twitter metadata to the new `midnight-studios-social-050.jpg` filename; this is metadata-only artwork.
- Made the white cat favicon transparent outside the mark and inside its eye/nose/mouth cutouts. The original uploaded mark supplies the final mask, preserving its contours. PNG/ICO and Apple icon alternatives have alpha transparency; versioned metadata URLs refresh the old black-backed icon. The on-page studio logo remains unchanged.
- Answered the future Journal editor question in `docs/journal-authoring-plan.md`. Existing Heading, Paragraph, Quote, Note and Development costs blocks already map content to styled components. No dashboard code was added.

## Verification

Production build, TypeScript, all project checks, and asset-integrity checks pass. New motion checks cover 21 viewport/section-height combinations with 401 samples each, forward and backward. They test that the hero cannot white out while the next game is offscreen/barely entering, that the fade is continuous and reversible, and that the modeled normal-flow stages do not overlap. These are analytical regression checks, not browser screenshots.

The five-game order and desktop alternation, Just Jump status, studio anchor fix, tablet grouping, existing animations and production SEO settings from 0.4.9 remain. All three content JSON files are unchanged. All 285 existing game/studio assets and all 24 original artwork files are preserved byte-for-byte. Only the five existing favicon files change, as requested; the new sharing JPEG/source are additions.

Generated JavaScript: 325574 gzip bytes across all routes; home entry scripts: 209498 gzip bytes including the legacy polyfill. Both remain within existing budgets. This is not a load-time or FPS measurement.

The supplied five screenshots and full 5.63-second mobile recording were reviewed. Browser preview/control was unavailable, so the revised live composition, touch scrolling and device performance have not been visually verified in a browser.

## Package

One Windows-compatible ZIP with one `Midnight-Studios-v0.5.0` root folder. Source, original artwork, production assets and built export are included. Dependency installations/build caches are excluded. Assets are stored once under `public/assets`; the preview launcher prepares `out/assets` before serving.

Extract once. Run `Start-Preview.bat` with Node.js 22.13+ installed and open **http://localhost:3050**. The version endpoint is **http://localhost:3050/__version**. For VS Code, open this version's folder, run `npm install`, then `npm run dev -- --port 3050`.
