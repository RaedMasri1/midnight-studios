# Scroll scene implementation

The imported version used a 2.9× background zoom, an exact crop of the reference screenshot for About, and split paper textures with two crease transforms for Dreamward. The visual revision replaces those treatments.

## Motion clock

`HomeMotion` reads visible chapter geometry and interpolates normalized scroll progress with an on-demand `requestAnimationFrame` loop. Pure poses in `lib/cinematic-motion.ts` determine CSS variables. No animation runtime dependency or scroll hijacking is used. Reversing scroll returns to the same pose. Hidden documents and settled scenes stop requesting frames.

## Hero

The background scale is bounded to 1–1.12. Character translation, rotation, scale and fade remain separate. Copy and logo disappear later, preserving the composition through the first half of the scroll. For short, unpinned layouts, hero progress starts at zero at the top of the page.

## Dreamward

The left cover rotates around the spine from 180 degrees (closed) to zero (open). Artwork stays completely transparent while the cover is closed, and an arrival interval holds the closed book before the cover begins opening. After 50% progress, four unique cutouts reveal in sequence and unfold from their bases. The castle, mountain, bridge/waterfall and island illustrations are complete silhouettes in an independently layered world stack above the book. They do not share the 3D cover/page rendering context. They are no longer split into upper and lower texture slices. This removes visible crease seams and the protruding folded images. Texture edge clipping avoids neighboring atlas-cell fragments.

## Studio

Five independent images share the same studio floor composition. The floor is static; only the left sketch is visible initially. Create reveals the centered puppy and cat, and Refine reveals the right-hand sheet. Whole images fade into view with a restrained scale change and settle automatically even if scrolling stops at a step boundary. Future images remain hidden. The left sketch stays anchored without a sideways slide or paper rotation. Headings and links remain live text. A compact held stage gives Imagine, Create and Refine separate scroll intervals; connector lines fill and captions change as each step arrives. The timeline remains visible throughout all phases. Desktop, tablet and phone use their own composition sizing.

## Journal

The journal joins the same scroll clock. The heading and saturated forest image reveal as the section enters the viewport; the card rises slightly later. This replaces page-load animations that completed offscreen. Keyboard focus immediately reveals the links.

## Footer

The footer has its own entry progress, normalized to the visible part of the short footer. Contact content and the studio name rise while a generated cratered lunar horizon moves independently. A separate slow surface drift continues while the footer is visible, with a Pause moon / Resume moon control. It pauses outside the viewport, while the document is hidden, and for reduced motion. See motion-refinement.md for current research and rendered-frame validation.

## Fallbacks

Reduced motion disables pinning and scroll transformations. No-JavaScript rendering presents a fully open book and assembled studio with normal section heights. Short windows and large type avoid pinning when content cannot fit. Keyboard focus keeps hero actions readable.

Chromium viewport checks include short/scaled desktop windows, portrait/landscape tablets, phones, reverse scrolling, both fallbacks and journal-to-article navigation. See `scroll-revision.md` and the outcome records in `review/browser-results.json`. They do not establish physical-device GPU performance or Safari behavior.
