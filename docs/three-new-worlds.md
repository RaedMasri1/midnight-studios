> Version 0.4.1 visual refinements are documented in [feedback-refinements.md](feedback-refinements.md). This report describes the initial three-world integration.

# Three new worlds — October 15, 2026

## Scope

The supplied latest project is the baseline. Three chapters are inserted after Dreamward and before About, using the same native scroll controller as the approved existing sections. The hero gets the client subtitle. Games index, individual game routes, metadata and the validated content snapshot include all five games. Existing hero/tablet/book/About/Journal/footer layouts and artwork are retained.

## Choreography and assets

**Break the Heel!** A separate coral shoe PNG-derived WebP approaches the block tower. The needle heel aligns with the tower; the first fracture begins after the approach interval. Three upper blocks each consist of eight real CSS cubes, with six independently shaded faces per piece. Seeded trajectories and spins are evaluated from scroll progress; they rise and settle rather than rerolling with time. The shopping district is a separate background with restrained camera movement. The shoe is an illustrated cutout, so this is a fixed-view 2.5D scene rather than an orbitable 3D shoe.

**Tadri** Four category tiles use independent quadrants of a transparent icon atlas. Their positions, depth and yaw follow the orbit, then converge into a two-by-two challenge arrangement. The central question mark rises as four player tokens enter. The visual describes multiplayer trivia; its tiles are an illustrative scene rather than playable trivia controls. The question mark and cards are DOM/CSS graphics rather than the exact ray-traced concept rendering.

**Idle Chaos** The renderer evaluates one fixed-seed 3D scene at 96 progress values. The island includes roads, trees, cars, buildings, a fountain, clock tower and waterfalls. The vortex grows, debris spirals, roofs lift, and lightning/fissures/cliff displacement build toward the final frame. This is coherent continuous authored geometry, not separate generated images or crossfades. Reverse scrolling seeks the same frames in reverse. Rendering and fidelity limits are documented in `idle-chaos-asset-pipeline.md`.

All chapter artwork is provisional concept artwork; official game artwork was not supplied. No dates, ratings or released stores were invented. Hero subtitle is exactly “Imagination never sleeps”.

## Browser delivery

`app/new-worlds.tsx` and its CSS module hold compositions. `lib/world-motion.ts` contains deterministic progress functions and the bounded frame cache. `app/home-motion.tsx` applies interpolated native scroll poses without per-frame React state. `app/world-sequence.tsx` handles canvas frame loading. No animation package, browser 3D engine or paid API is required at runtime.

The controller only schedules while visible poses need settling. It restores original inline values when reduced motion changes or the component unmounts. The new scenes have complete static server-rendered poses. Reduced motion removes long pin intervals and keeps Idle Chaos on its poster. Tiny-height/large-type/overflow cases use normal flow. Mobile copy sits above the scene; desktop uses alternating two-column compositions.

Idle Chaos begins fetching within 650px of its chapter, selects a 660×480 sequence at widths up to 700px, and otherwise uses 1100×800 frames. At most three fetches and twelve decoded frames are retained. Distant seeks abort obsolete requests. The nearest ready frame prevents blanks during rapid seeks; it may temporarily lag on a cold connection. Far-offscreen caches are cleared. The canvas uses a 1.5 density cap. Fetch/decoding failures retain the poster or last ready frame.

## Content integration

`upcomingChapters` in `content/home.json` selects a published game, an authored motion kind, headline, link label, concept disclosure and three phase labels. Chapter references are validated against published game records. Titles, genre, availability, cover artwork and detail-page text come from `content/games.json`. New records do not require new page components. A completely new animation kind still requires authored scene geometry; the dashboard is not intended to generate arbitrary animation scenes.

## Verification actually completed

- Production Next.js build and TypeScript; eleven application routes export successfully.
- Lint: zero errors, local-image optimization warnings.
- Existing export/link/metadata, media, Journal/content, store-adapter and motion checks.
- New finite/clamped/reversible/continuous pose checks, heel-before-fracture timing and nonoverlapping final trivia tile bounds.
- Decoded cache eviction/closing checks, frame-window bounds and nearest-frame selection.
- All 192 frame files checked; the renderer independently decoded the sequence and verified 96 distinct desktop frames.
- Source motion contact sheet and MP4 inspected; dependency and delivery sizes recorded separately.

No new browser screenshots, browser playback tests, Lighthouse results or physical-device measurements were produced. The managed environment did not expose the required browser runner. Supplied older browser reports are historical evidence for the baseline only. A successful build is not proof of final browser composition or smoothness.

## Local visual review

Use the included production export via `Start-Preview.bat`. Review in a current Chrome/Edge, then Safari/iOS where relevant. Suggested CSS viewports: 1900×882, 1440×900, 1267×589, 820×1180, 390×844 and 360×740.

1. Scroll from Dreamward through all three chapters, then reverse slowly. Check copy stays clear of artwork and phase labels remain readable.
2. For Break the Heel!, check the needle heel reaches the upper block before fracture, fragment paths remain clear of copy, and the district stays sharp.
3. For Tadri, check all four topics remain legible during orbit and the final challenge tiles do not overlap. The scene should reverse without resetting.
4. For Idle Chaos, check calm-to-storm continuity, frame catch-up during fast scroll, reverse seeking, and the retained poster on a failed connection. The MP4 is useful for comparing the asset sequence, but does not establish canvas playback quality.
5. Switch reduced motion on while on the page; confirm complete static scenes and normal section heights. Turn it off and repeat. With JavaScript disabled, verify complete images and working game links.
6. Check each Coming soon link, the Games index, Journal navigation and original hero/book/About/footer sequences. Check a narrow landscape window and larger text for readable normal-flow fallback.

## Fidelity to the concept

The intended palettes, game-specific storytelling and independent moving layers are implemented. Pixel-identical rendering to a single generated concept image is not claimed. The shoe uses a fixed-view cutout, Tadri uses CSS materials, and Idle Chaos uses a modeled city rather than exact painted buildings. Most city buildings remain intact; the visible destruction is localized. These differences are explicit so the asset preview and browser result can be judged on their actual form.
