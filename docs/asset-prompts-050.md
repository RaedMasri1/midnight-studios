# Asset changes — 0.5.0

## Social sharing card

Selected image made with the built-in image-generation tool, then proportionally resized/padded and JPEG encoded for delivery. No Higgsfield service was used.

- Edit target: `public/assets/midnight-studios-social-049.jpg`.
- Character reference: `public/assets/hero-puppy.webp`.
- Selected source: `design-assets/midnight-studios-social-050-source.png`.
- Production image: `public/assets/midnight-studios-social-050.jpg`, 1200 × 630.
- Metadata references the new filename to avoid retaining an older card at the same image URL. Social platforms can still cache previously shared previews.

Final prompt:

> Use case: compositing. Edit target Image 1: the approved Midnight Studios social sharing card. Supporting insert Image 2: the exact orange puppy character used on the homepage. Change only this: add that same puppy inside the bright circular portal on the right, suspended in its cheerful jumping pose, entirely within the bright game world, around the portal's center-right. Match the supplied puppy's design, orange fur, floppy ears, cream muzzle and belly, black eyes and proportions exactly. Make it recognizably the existing homepage character, about one third of the portal opening's height, clearly visible in a thumbnail; subtle matched sunlight and depth. Keep Image 1's canvas ratio approximately 1.91:1, cave, portal, cliffs, trees, lighting, composition and ALL typography exactly unchanged. All text must stay verbatim: Midnight Studios / Imagination never sleeps / Independent mobile game studio. Do not place the puppy over the text, change the lettering, add extra characters, add badges or redesign anything. This is a localized character insert into the existing approved card.

## Transparent favicon

The final icon preserves the exact original uploaded `design-assets/favicon-logo-source.png`. The editable `public/favicon.svg` uses that unchanged image as an SVG luminance mask: white becomes the visible mark and black becomes transparency, including the eyes/nose/mouth. There is no black backing rectangle and the original contours are not redrawn. Standard SVG rasterization produces 96/192px RGBA PNGs and the 180px Apple icon; the ICO contains transparent 16/32/48/64px alternatives. Metadata adds `?v=050` to refresh the previous icon URLs.

Two generated background-removal trials were rejected for inaccurate cutouts and are not included or referenced. The final favicon uses the original logo through the existing editable SVG icon format, not either generated trial. The on-page studio logo remains unchanged.
