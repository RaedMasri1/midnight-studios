# Motion refinement

The latest feedback identified two perceptual failures: the About images appeared to unfold upward, and the moon looked static even though its CSS variables changed.

## Current behavior

About uses whole-image reveals with a 720 ms custom easing curve and a small scale change. No clipping, bottom-up wipes, paper rotations or lateral sheet slides are used. Future images remain hidden until their timeline step. Activating Create reveals the puppy and then the cat with a short stagger; Refine reveals the right sheet. Reveals finish automatically if the user stops scrolling immediately after crossing a step boundary. The centered positions and compact timeline remain in place. Scrolling back hides the later images smoothly.

The lunar image now has separate camera and surface layers. Scroll-camera movement is concentrated in the latter part of footer entry, when the surface can be seen. A slow drift continues while the footer is visible, including at the bottom of the document. The Pause moon button pauses the drift; Resume moon restarts it. The drift pauses outside the viewport or while the document is hidden. Reduced-motion and no-JavaScript rendering show the static complete scene.

The left sketch has the same restrained whole-image entrance. Its reveal begins while it is actually entering view, rather than completing during page load below the viewport.

## References and access limits

The requested GitHub repositories could be read. The supplied gallery sites, Playwright documentation site and general search engine were blocked by the environment's network proxy with HTTP 403. Therefore this review does not claim to rank the current best live gaming/storytelling websites.

Sources that directly informed the motion changes:

- [Taste Skill: high-end visual design](https://github.com/Leonxlnx/taste-skill/blob/main/skills/soft-skill/SKILL.md): coordinated easing, restrained depth changes and compositor-friendly motion. Applied to these two sections within the existing visual design.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md): interruptible animation, reduced-motion support, visible focus and a pause control for persistent motion.
- [React Bits FadeContent source](https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/FadeContent/FadeContent.jsx): whole-content visibility reveals triggered on entry, with time-based settling rather than a geometric crop.
- [Gaming narrative source study](https://github.com/adrianhajdin/award-winning-website/blob/main/src/components/About.jsx): coordinated scroll triggers and held storytelling stages. This is a Zentry-inspired source example; its live original was not inspected. Its fullscreen image masking is not used for the studio characters.

UI UX Pro Max, awesome-design-md and the supplied rendering libraries were also reviewed as background references. The implementation uses the existing scroll controller and CSS transitions, with no new production dependency.

## Validation

The browser runner checks all timeline states, reverse order and centering. It now also stops at the beginning of Create and Refine and verifies that complete images finish revealing without more scrolling. It verifies the moon's actual computed movement at the bottom of the page and its pause/resume behavior.

A separate rendered-frame check compares visible lunar-surface pixels three seconds apart while the page remains still. Outcome records are in `review/moon-pixel-proof.json`; `review/motion-preview.mp4` records the About stages and the moving footer. Production build, TypeScript, project checks and lint accompany Chromium viewport simulations. These checks do not establish physical Safari performance.
