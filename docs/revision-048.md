# Revision 0.4.8

Built from the verified 0.4.7 release, using all 13 attached images in the October 16 review.

## Requested adjustments

- Global footer slogan: one unbroken “Imagination never sleeps”, without the final period. Responsive spacing keeps it beside the studio name.
- Hero: one compact “Independent game studio. Care in every detail.” line above the main heading. The repeated right-hand description is removed. Mobile bottom spacing compensates for the shorter copy block.
- Just Jump tablets: two new portrait 3:4 gameplay visualizations adapted from the supplied phone references. The display itself uses the same 3:4 ratio. Images use contain, so they fill a matching screen without cropping or stretching. Original mobile screenshots remain in the detail gallery.
- All five homepage games use a shared status, genre, game name, description and action component. Copy describes each game’s known play rather than generic filler.
- Studio support text is right-aligned within the right-hand block.
- Homepage Journal has a 100svh minimum reading chapter at desktop, tablet and mobile sizes; more articles can grow naturally. Its reveal completes as the full chapter arrives.
- The Games index keeps Just Jump’s first section and groups the following entries into two-game screens on tablets. Desktop and mobile retain individual reading sections. Large text and short windows can increase the height instead of clipping content.
- Copy was reviewed across all 11 public content routes. See `copy-review-048.md` for keep/remove decisions and `reference-review-048.md` for the supplied guidance.

## Tablet image sources

Generated using the built-in image tool, then copied into the project and converted to optimized WebP without changing the composition. Both selected source images are 1086 × 1448. Web variants are 480 × 640 and 768 × 1024.

| Scene | Supplied reference | Selected source | Website asset |
| --- | --- | --- | --- |
| Sunlit cliffs | `design-assets/just-jump-tablet-forest-reference.png` | `design-assets/just-jump-tablet-forest-source.png` | `public/assets/just-jump-tablet-forest.webp` |
| Crystal caves | `design-assets/just-jump-tablet-caves-reference.png` | `design-assets/just-jump-tablet-caves-source.png` | `public/assets/just-jump-tablet-caves.webp` |

The homepage labels them “Gameplay visualization”. These are adaptations of supplied development imagery, not screenshots captured from a tablet build.

### Crystal cave prompt

“Use case: precise-object-edit. Asset type: portrait TABLET gameplay visualization derived from this exact phone screenshot, flat image only, 3:4 aspect ratio. Primary request: expand this supplied Just Jump crystal-cave screenshot HORIZONTALLY on the left and right to fill a portrait tablet display. Preserve the full original vertical composition from top to bottom. Do NOT crop, zoom, stretch or redesign the game. The existing dark gray cat jumper with green eyes must remain the same, on the same pink glowing platform, with the same blue crystal formations, angular dark navy cave walls, tracks, floating pink platforms, lighting, low-poly game graphics and proportions. Add only natural lateral continuation of these SAME cave walls and crystal environment to the new side space. Preserve the original central game area and all original platform positions and shapes as faithfully as possible. Adapt the same existing HUD across the wider top without changing its design: avatar/player CoolGamerTag12, coin 32015, gems 2617, feathers 6564, height 1,300m; keep these exact values, no additional controls, no new text. Keep the settings icon and original HUD style. Nothing outside the game image: no device, no frame, no borders, no sidebars, no blurred or solid filler strips. Full bleed gameplay all the way to every edge. The result must look like the same build running on a wider portrait 3:4 tablet, NOT a newly invented game illustration.”

### Forest prompt

“OUTPUT ORIENTATION IS CRITICAL: a VERTICAL PORTRAIT image with aspect ratio 3:4 (WIDTH 1344, HEIGHT 1792). HEIGHT must be greater than WIDTH. Do not produce a horizontal/landscape image. This must fit a portrait tablet screen. Use case precise-object-edit. Edit this exact phone gameplay screenshot from Just Jump: keep its ENTIRE vertical view from the top HUD down to the original dark blue pine silhouettes at the bottom. Preserve the original center as closely as possible: orange puppy facing right with blue backpack at the SAME vertical location and same proportions, same orange cliffs, turquoise sky, blue distant canyon, green cone pines, clouds, valley. Extend ONLY the left and right by approximately 258 pixels each side relative to the original 828x1792 screenshot to make a 1344x1792 PORTRAIT 3:4 composition. No vertical cropping, no zooming, no stretching and no new game design. The lateral extensions continue the exact existing low-poly cliffs/pines, not new objects or mechanics. Preserve all existing HUD graphics: player CoolGamerTag12 avatar, coins 10282, gems 546, leaves 2049, Best: 7,593m; left icons gear trophy shop flag ticket backpack; right energy 100/100. Keep the same simple mobile-game render style rather than cinematic art. Place the same controls appropriately in this moderately wider PORTRAIT display, not across a landscape panorama. Output flat full bleed gameplay to all edges, no device, no border, no blur bars, no flat color filler gutters. FINAL CANVAS: VERTICAL 3:4, 1344 WIDE by 1792 HIGH.”

## Verification

Production compilation and TypeScript; route/link/metadata checks; content/media/review/Journal checks; reversible motion calculations; exported game-introduction hierarchy and media references; source asset preservation against 0.4.7. The ZIP is extracted and checked by manifest, and the saved download is retrieved and checked again. Preview asset preparation is checked offline.

Live browser rendering, physical-device playback, and network speed are not verified in this managed workspace. No browser screenshot, Lighthouse score, FPS or device-performance claim is made.

## Opening the release

Extract the single ZIP once. Open `Midnight-Studios-v0.4.8` and run `Start-Preview.bat` with Node.js 22.13+ installed, then visit http://localhost:3048. The launcher prepares the preview image copies from `public/assets`.

For the familiar VS Code workflow, use `npm install` followed by `npm run dev`. For Netlify or another static host, run `npm run build` and upload the complete generated `out` folder.
