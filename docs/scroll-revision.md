# Scroll revision — October 12, 2026

Both supplied MP4 recordings were inspected as chronological frames, with full-resolution views of the hero and book. The first recording (3.26 seconds, 1900×884) moves between the hero and Just Jump. The second (7.13 seconds, 1902×886) shows the open book's colliding silhouettes and the studio timeline switching rapidly to its final step.

## Diagnosis and changes

| Reported issue | Reproduced cause | Change |
| --- | --- | --- |
| Desktop hero scrolls away without a cinematic interval | All pinned scenes were disabled below 620 CSS pixels of viewport height. Short windows and scaled desktop displays can hit this cutoff. | Support stages from 480 pixels when their readable content fits. Hold the hero for its independent camera, emblem and bounded character movement. |
| Desktop book appears already open | The unpinned progress formula advanced during the section's entrance. Artwork could also appear in its static finished pose before an offscreen section received its first animation frame. | Initialize every animated section immediately, start pinned progress at full arrival, and retain an initial closed-cover interval. Short-window fallbacks also begin from the closed pose. |
| Dreamward silhouettes intersect and show horizontal cuts | Multiple artwork planes, some duplicated, shared the pages' 3D rendering context and crossed each other or were occluded by page surfaces. | Use four unique whole silhouettes in a separate, flattened stack. Open the cover first; unfold mountains, castle, waterfall and islands in order with consistent depth order. Bound the composition to the available viewport height. |
| About reaches the last step before the timeline is visible | The whole composition moved naturally through the viewport while progress was already advancing. There was no held stage. | Add a sticky stage with a long scroll interval. Begin at Imagine, hold each of three phases, then Create and Refine. Fill connector lines progressively, update the step caption, and stage the existing separate images. |
| Journal has no visible animation on arrival | CSS entrance animations began at page load while the journal remained below the viewport. | Register Journal with the shared scroll controller; reveal its heading/image and then card during entry. Reverse with upward scrolling and reveal links immediately on keyboard focus. |
| Tablet mockups overlap text while rotating | Device transforms extended beyond the visual column, especially near tablet widths. | Stack the scene and copy at tablet widths, add clearance for rotated corners and shadows, and reduce lateral spread. Wider desktop layouts retain two columns. |

The studio and journal artwork, original game screenshots and logo were retained. Very small viewports, large text, reduced motion and absent JavaScript continue to use readable natural-flow layouts when pinning cannot fit.

## Validation

Production build, TypeScript and all six project checks pass. Lint retains 16 existing local-image optimization warnings and has no errors.

The browser regression runner checks real scroll positions, wheel input, pinned-stage geometry, full closed-cover arrival, cover-before-art order, one instance of each illustration, clearance between artwork and heading/controls, tablet/text separation throughout rotation, all three studio phases and their reverse order, lazy-image-load timing, Journal entry/reversal, keyboard reveal and article navigation. Screenshots are inspected in addition to DOM checks.

Viewport and outcome records are in `review/browser-results.json`. The browser runner is in `review/check-scroll-fixes.cjs`; it requires Playwright and Chromium as test tools, separately from the site's production dependencies. Set `TEST_URL` to the served production export and optionally `REVIEW_DIR` to a writable capture folder.

The previous checks covered pose endpoints but did not require a held stage in a short desktop window or visibility of every timeline phase. Those regressions are now explicitly checked. Browser viewport simulation does not establish performance or rendering on physical Safari devices.
