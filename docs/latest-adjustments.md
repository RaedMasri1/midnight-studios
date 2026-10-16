# Earlier requested adjustments

This document records the preceding revision. See `motion-refinement.md` for the current whole-image reveals and continuously visible moon motion.

# Latest requested adjustments

This revision addresses the follow-up feedback after the scroll revision.

- About has a shorter held interval: 75% of a viewport of additional desktop scrolling and 80% on phones, rather than 160%/140%. Imagine shows the left sketch at full opacity, with all other foreground assets hidden. Create reveals the puppy and cat at full opacity using a brief geometric reveal. Refine reveals the right-hand paper and pencil. Revealed images remain in place as the composition builds; reversing the scroll removes them in reverse order. The floor remains a static backdrop. The puppy uses its original central anchor, including when its size is constrained in short windows.
- Book-cover text is sized in container-relative units, so the title and supporting lines fit the cover independently of viewport width. Supporting copy can wrap inside the border.
- Just Jump begins its device movement during viewport entry. The scroll progress no longer waits for the stage to reach the top, and the initial pose has no additional dead interval. Existing clearance from the copy is retained.
- The footer now joins the scroll controller. Its contact area and studio name rise on entry while the lunar horizon moves independently. A generated 2172×724 realistic cratered lunar image replaces the concentric CSS rings. The image is concept artwork, not a NASA photograph. Reduced-motion and no-JavaScript layouts remain fully visible.

The runner in `review/check-scroll-fixes.cjs` checks the hidden/visible assets and full opacity at every About step, the compact scroll interval, puppy centering, immediate tablet movement and text clearance, book text bounds, and footer motion reaching its final pose at the bottom of the page. It also retains the book, journal, reverse-scroll, keyboard and fallback checks from the previous revision. See `review/browser-results.json` for the complete results.

Production build, TypeScript, project checks and lint are used alongside Chromium captures. Viewport simulation does not establish rendering or performance on physical Safari devices.
