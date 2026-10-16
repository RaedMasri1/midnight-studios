# Current asset revision

The current homepage replaces the previous About screenshot crop and split book sprites. Original generated PNGs remain in `/workspace/generated_images`; optimized WebP files are in `public/assets`. The October 12 scroll revision reuses this artwork: four unique Dreamward silhouettes sit in a controlled stack above the independently animated cover/pages, and the five studio assets remain separate.

| Asset | Dimensions | Purpose |
| --- | --- | --- |
| studio-dog.webp | 1161 × 1354 | Orange puppy with left polygon mesh half |
| studio-cat.webp | 1191 × 1321 | Separate gray cat with green eyes |
| studio-sketch.webp | 1536 × 1024 | Left sheet with puppy front/back sketches |
| studio-tools.webp | 1536 × 1024 | Right drawing sheet and orange pencil |
| studio-floor.webp | 1672 × 941 | Empty white studio floor with display blocks |
| dream-cutouts.webp | 2172 × 724 | Four whole illustrated pop-up silhouettes |
| journal-forest.webp | 1672 × 941 | Vivid forest world and jumping puppy |
| footer-moon.webp | 2172 × 724 | Generated realistic cratered lunar horizon, optimized from PNG |

Character and paper assets were generated separately with transparent backgrounds using the supplied visual reference, rather than extracted as screenshot fragments. Their camera and lighting were matched to assemble the studio scene. The floor and journal are opaque. WebP conversion preserves transparency; the journal includes 640, 960 and 1280 pixel variants. These are illustrative concept assets, not claims of released gameplay.

The original logo, game UI screenshots and earlier reference assets remain available. The earlier delivery notes below describe the uploaded version and are historical.

---

# Generated production assets

All three assets used OpenAI's built-in Image Generation tool, with the approved homepage as the visual reference. No Higgsfield generation was used. Original PNGs are in `design-assets/`; compressed runtime copies are in `public/assets/`.

| Runtime path | Original | Role |
| --- | --- | --- |
| `/assets/portal-cave.webp` | `design-assets/portal-cave.png` | Textless approved portal environment, 1672 × 940 |
| `/assets/hero-puppy.webp` | `design-assets/hero-puppy.png` | Separate transparent Just Dog layer, 1236 × 1273 |
| `/assets/dream-paper-atlas.webp` | `design-assets/dream-paper-atlas.png` | Four consistent transparent paper-art cells, 2172 × 724 |

`/assets/approved-homepage.webp` is a lossless transcode of the user-supplied reference, not a regenerated About image. Its original is `docs/approved-homepage-concept.png`. The About crop uses source row 1207 and a 336-pixel section height at the reference's 705-pixel width.

## Portal prompt

Use case: stylized-concept. Asset type: production website hero background, landscape 16:9 high resolution. Use the TOP HERO SECTION of the supplied approved Midnight Studios homepage as the exact visual reference: a dark cinematic cave and foliage, a large circular stone portal toward the upper right/center-right, glowing white-gold rim, brilliant cyan sky and the same playful low-poly golden cliffs, pine trees and turquoise distant mountains through the portal, glossy damp black rock floor reflecting light. Extract/recreate ONLY the environment artwork. Preserve the reference's framing and shapes, with the left third very dark for a white logo and lower edge dark for live website text. Do not include the orange dog because it will be a separate moving layer. No logo, no mascot, no text, no UI, no buttons, no typography. The portal and cave should feel polished and dimensional. Clear foreground leaves at upper corners, detailed but restrained. This is a textless separate scene asset, not a screenshot of a website. Match the approved hero faithfully.

## Character prompt

Use case: background-extraction. Asset type: production game character cutout for a website hero. Extract/recreate the orange jumping dog from the hero section of the supplied approved Midnight Studios homepage. One orange golden puppy, compact rounded body, soft 3D toy appearance, small dark eyes and nose, floppy ears, little cream muzzle and belly, exactly the same orange dog identity, in the same upward jumping pose, facing slightly right, paws extended. Entire body and all limbs visible, no platform, no landscape, no floor, no typography, no other characters. Genuine transparent background, no cast shadow on a background. Only the puppy centered with modest padding. High detail, clean alpha edges. Preserve the character's proportions and approved playful look.

## Paper artwork prompt

Use case: stylized-concept. Asset type: texture atlas for a physically hinged pop-up book on a website. Use ONLY the Dreamward book section of the approved reference for the exact illustrated world, palette and shapes. Produce a wide HIGH RESOLUTION atlas with 4 distinct isolated paper-cut artwork pieces laid out in 4 equal horizontal cells side by side, each asset entirely inside its own quarter of the image with transparent padding, no overlap between cells. Cell 1: a backdrop silhouette of pale blue alpine peaks, fluffy clouds and a distant tiny floating green island. Cell 2: the main beautiful white castle with orange-gold pointed roofs, sitting on a lush green floating cliff island with trees, turquoise waterfall and clouds. Cell 3: a foreground wide green terraced island with pine trees, cliffs, a large turquoise waterfall down the front, cloud banks, and a little white arched bridge. Cell 4: a group of fluffy white/cyan clouds and a smaller green floating island with trees. All four must have FLAT FRONT ELEVATION, no perspective rotation, like printed dimensional storybook die-cut art that can be hinged at its bottom edge. Richly detailed polished 3D-toy illustrations like the approved scene, clean silhouette edges, visible warm white paper edge along the contour. Transparent background, no book, no page, no dark background, no lettering, no UI, no borders or cell labels. Consistent scale/style/color, no large black shadows. These are independently moving layers, not a complete finished scene.
