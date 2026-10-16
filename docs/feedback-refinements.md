# Visual refinements — October 15, 2026, version 0.4.1

Historical update: version 0.4.2 subsequently replaces the Just Jump promotional cover and refreshes the Journal. See `journal-refresh.md` for the current implementation.

## Feedback reviewed

The supplied Tadri close-up, Just Jump Games-page screenshot and both desktop recordings were inspected. The heel recording shows a separate, bounded art background and an uncovered strip before Tadri. The Idle Chaos recording shows the storm staying small relative to the island and a cloud cap that reads as separate rounded blobs. These are recordings of the previous delivery, not verification of this revision.

## Changes

### Tadri

Four new illustrated player characters replace the CSS pawn silhouettes. Each is a separately positioned cell in a transparent atlas with its own staged entrance. Faces, hair, clothes, arms, shoes, glasses/headphones and headwear make them recognizable as players. The purple, gold, green and blue palette is retained.

The answer cards resize by changing the geometry of four isolated elements. The previous nonuniform X/Y scale and compensating text scales are removed. Radius stays consistent as each tile becomes a rectangle, so corners and lettering no longer flatten into stretched arcs. Materials use a finer highlight, restrained bevel and softer elevation. Category text is larger, and answer text increases from 2.1 to 2.8 scene-width units on desktop, with a further narrow-screen adjustment. Final card centers leave a three-unit gutter horizontally and vertically; player art fits below the bottom row.

This resize performs local layout for four absolutely positioned cards during the morph. No page flow depends on their dimensions. It is not claimed to be a transform-only animation. The existing orbital choreography, reverse seeking and reduced-motion static composition remain.

### Break the Heel!

A newly generated 1983×793 desktop panorama expands the same pastel shopping world to the left, keeping quieter space for copy and the boulevard on the right. It is not a zoom of the previous image. The original scene stays available below 1024px.

At desktop widths, the background is attached to the full held stage instead of the bounded artwork container. Its full width renders at natural aspect ratio, anchored at bottom:0. Taller windows extend the matching sky behind it. It has no scroll scale or zoom. This removes the uncovered strip caused by the previous scene container ending above the section boundary. The shoe, tower, shadow and individual fragments keep their existing independent movement and contact geometry. The new background contains no baked-in shoe or blocks.

### Just Jump! Games cover

A new landscape key artwork follows the actual forest screenshot's orange puppy, blue scarf, ochre cliff platforms, conifer trees and cyan sky. Its lighting and material treatment match the other promotional game covers. It replaces only the Games/card cover reference and is explicitly labeled promotional concept artwork inspired by gameplay. The original supplied screenshots remain in the homepage tablet mockups and game-detail gallery. The generated cover is not represented as actual gameplay.

### Idle Chaos

The source renderer and coherent scroll sequence now use a broad volumetric thundercloud, a rotating funnel with street-level dust, wind-deformed trees, uprooting trees, lifted roofs, a collapsing front house, rain, debris, fork lightning and atmospheric city dimming. The storm is modeled as a continuously evaluated 3D density field rather than the previous stacked cloud meshes. The canvas mask now feathers only the outer edge so it does not fade the storm mass. Revisioned fetch URLs prevent an older cached sequence from masking the update. See `idle-chaos-asset-pipeline.md` and the included `animation-review/idle-chaos-motion.mp4` for the final authored effects and limits. No external media-generation service or Higgsfield credits were used.

## Artwork and source

Generated through the built-in OpenAI image tool, with original PNGs retained:

| Production asset | Editable source |
| --- | --- |
| public/assets/heel-district-desktop.webp | design-assets/heel-district-desktop-source.png |
| public/assets/tadri-players.webp | design-assets/tadri-players-source.png |
| public/assets/just-jump-cover.webp | design-assets/just-jump-cover-source.png |

Smaller 640px and 960px Just Jump cover variants are included. See `asset-prompts-feedback.md` for the generation brief. Idle Chaos is regenerated from `design-assets/render-idle-chaos.py`, not independent generated images.

## Export consistency

Repeated static exports were retaining obsolete hashed assets in out/. The build wrapper now clears that generated directory before building, so the ZIP contains one current export and the size audit measures the current route chunks. A failed build does not provide a preview export; rebuild successfully before using npm start. Source files and artwork are outside the cleaned directory.

## Verification scope

Production build/TypeScript and the existing project checks are run again for delivery. Scene checks include the final card gutters, avatar clearance, original gameplay-gallery classification, panorama markup and four independent avatar elements. Frame files are decoded and the source sequence is inspected separately.

The required browser-control tool is unavailable in this managed environment. The Sites workflow requires skipping browser QA in this case; no unsupported browser was installed or started. Consequently, this revision has no new browser playback, device FPS or screenshot verification. The included movie is the rendered source sequence, not a screen recording of the website. The previous supplied browser reports are historical and do not verify this revision. Review the updated ZIP in a real browser before publishing.
