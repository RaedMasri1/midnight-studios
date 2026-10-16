# Mobile portal artwork — version 0.4.3

Mode: built-in OpenAI image generation, edit of the existing portal scene. No Higgsfield or fallback CLI was used.

## Selected asset

- Edit target: `public/assets/portal-cave.webp`, the existing desktop environment.
- Saved source: `design-assets/portal-cave-mobile-source.png` (941 × 1672).
- Production: `public/assets/portal-cave-mobile.webp`.
- Responsive variants: `public/assets/portal-cave-mobile-480.webp`, `public/assets/portal-cave-mobile-700.webp`.
- Selection: `content/home.json` → `hero.mobileEnvironment`; a native picture source selects this at widths up to 700px. Desktop keeps its original source.

The puppy and logo remain separate assets. No lettering, interface or character is baked into the new environment. The original generated PNG is included for future asset work.

## Final prompt

```text
Use case: precise-object-edit. Asset type: mobile portrait9:16 hero background for the existing Midnight Studios website. Edit target: supplied existing dark stone cave with a circular glowing portal into bright Just Jump cliffs, evergreen trees and cyan sky. Recompose this SAME scene for a tall mobile screen. Preserve the same visual identity, portal stone material, golden glowing rim, low-poly ochre cliffs, conifers, cyan sky, foreground leaves and reflective cave floor. Do not invent a different world, add architecture, change style or enlarge/crop the supplied landscape center.
Composition: portrait9:16, an optically circular portal toward the RIGHT in the upper-middle, its bright world centered around x72%,y34%. Show the portal as a coherent object, with most of its rim visible, rather than a zoomed slice of the landscape. The LEFTmost35–40% of the upper60% of the canvas must be deep nearly-black cave shadow with faint stone texture, especially the top-left and mid-left, providing quiet dark space for a white logo. Keep the upper edge dark behind a mobile header. The BOTTOM38% must also be spacious nearly-black cave floor/shadow, with only very subtle low-contrast blue reflections, providing clear dark space for a large white headline and buttons. Let the portal light live mainly at right-center with restrained foliage along far edges. Maintain rich cinematic detail and soft atmospheric depth while preserving legibility areas. No hard black rectangle or visible compositing seam. No puppy or other character: the website already animates its puppy as a separate transparent layer. No logos, lettering, title, UI, watermark or baked-in typography. Only the matching mobile environment; do not render a website screenshot.
```
