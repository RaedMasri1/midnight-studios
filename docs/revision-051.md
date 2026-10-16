# Revision 0.5.1 — continuous hero handoff

## Approved scope

Reconnect the original character motion and staggered background/text/button fading, keep movement alive through the transition to Just Jump!, and prevent a long fully white interval. Sections must stay separate. This revision changes the hero motion only, plus its checks, version labels and documentation.

## Implementation

- `heroProgress` now provides one continuous, strictly increasing scroll timeline over the full hero section. Its smooth curve has no stopped interval or velocity break at the point where sticky positioning releases. It depends on the measured section height, avoiding a separate progress reset when the mobile browser's visible height changes.
- Camera, mark, text/buttons and character use the same interpolated progress. Their opacity curves are staggered again; text begins fading during the character motion instead of waiting for a later independent exit fade. Camera travel continues through the handoff.
- The character keeps its existing arc, rotation and scale, with a short additional downward tail before fading. Its motion does not finish at the end of the pin.
- The existing portal/character layer counters the stage's native upward exit, using the actual measured stage height. It stays framed inside the original overflow-hidden stage while Just Jump! enters immediately below it. This is a bounded inner transform, not an overlay on the next game; the next section's position and all pin lengths remain unchanged.
- The background wash reaches full white only after the hero has left the viewport. Its former empty full-screen tail is removed by coordinating movement, fading and section entry. No negative margins, duplicated game content, scroll interception, fixed transition panels or new animation dependencies were added.
- Existing no-JavaScript output, keyboard focus behavior and reduced-motion fallback remain. Reduced motion disables the portal transform; normal short-window/large-text flow does not apply the follow compensation.

## Verification

Production build and TypeScript pass, and all project checks pass. The updated hero regression checks cover 21 viewport/stage-height combinations and 401 positions each, forward and reverse. They check continued character/camera movement after sticky release, a downward character tail, simultaneous movement/fading, continuity through release, bounded follow distance, no modeled stage overlap, and substantial next-section visibility before the world is nearly white. Short-window fallback functions are also checked. See `docs/hero-motion-audit-051.json` for representative numerical samples.

All other chapter pose functions are byte-for-byte unchanged. All three content JSON files are unchanged. All 291 existing public files and all 25 artwork/pipeline files are preserved byte-for-byte, including the social card, favicon, screenshots and every animation frame. No dashboard work or new image generation was performed.

Generated JavaScript: 325700 gzip bytes across all routes; homepage entry scripts: 209625 gzip bytes including the legacy polyfill. Both remain within the existing budgets. These are size estimates, not measured load times or device performance.

The user's old and new recordings were compared before implementation. Browser preview/control is unavailable in this managed environment, so the revised browser playback, touch feel and actual rendered layout are not visually verified here. The checks and numerical samples are not a replacement browser recording, Lighthouse run or physical-device test.

## Download and preview

One Windows-compatible ZIP with one `Midnight-Studios-v0.5.1` root folder. Original artwork, production assets, source and the built export are included. Shared image assets are stored once under `public/assets`; the launcher prepares the `out/assets` copy before serving. Installed dependencies and rebuild caches are excluded.

Extract once. With Node.js 22.13+ installed, run `Start-Preview.bat` and open **http://localhost:3051**. Check **http://localhost:3051/__version** for version 0.5.1. To use VS Code, open this version's folder, run `npm install`, then `npm run dev -- --port 3051`.
