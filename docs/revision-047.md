# Revision 0.4.7

Based on the verified 0.4.6 project archive, with the ten screenshots supplied on October 16.

| Request | Implementation |
| --- | --- |
| About artwork below the navbar | Raise the composition and move the puppy/cat higher within it; keep the approved text position. Mobile retains its natural stacked layout. |
| Tablet hero logo and lower copy | Add a tablet source of the same cave/portal environment with dark left wall and extended floor. Select it with picture media queries. Raise the mobile and tablet copy with responsive bottom spacing and strengthen the dark text area. Desktop retains its original artwork and copy position. |
| Contact email animation | Float the existing monochrome envelope, gently open its flap and lift the letter. Rotate the faint orbit. Pause offscreen and disable for reduced motion. |
| Desktop Games opening and scrolling | Size the cover collage against viewport height and reduce the opening heading when height is limited. Reveal each game image and its copy with a longer eased entrance and stagger. |
| Mobile Games opening | Reserve a full first viewport for the copy/covers, then show each game in its own full-height reading section. Short screens and enlarged text can grow naturally. |
| Tablet Games opening with Just Jump | On portrait tablets, reserve 52% of the viewport for the introduction and 48% for Just Jump. Dreamward follows. Content may grow when needed for legibility. |
| Journal footer placement | Use a full-height flex column for inner pages. Let the Journal surface fill spare height before the footer. The footer remains in document flow after all published articles. |
| Tablet Heel seam | Remove the 8% background offset and cover the complete stage on portrait and landscape tablets. Keep shoe, blocks and animation poses unchanged. |
| Tablet homepage game typography | Increase headings, descriptions and buttons consistently across all five stacked game chapters. Preserve the existing mobile sizes and desktop side alternation. |
| Mobile studio floor seam | Separate the floor from the inset character area, cover the full stage with slight overscan, and use the sampled gray floor color behind it. Keep all independent characters, sketches and process controls. |

## Tablet artwork

Generated with the built-in image tool from `design-assets/portal-cave.png`. Original output: `design-assets/portal-cave-tablet-source.png`; website files: `public/assets/portal-cave-tablet.webp` and its 800px variant. Source size: 1122 × 1402.

Prompt: “Use case: precise-object-edit. Asset type: tablet website hero background, portrait 4:5 composition. Edit target: the provided approved cave/portal environment. Reframe and extend this exact scene for a tablet, preserving the same circular stone opening, low-poly orange cliffs, green triangular pines, bright blue canyon, plants, rim light, wet cave floor, materials and colors. Keep the illuminated portal in the UPPER RIGHT, bounded roughly x45–100%, y10–63%. The LEFT 40% must be deep nearly black cave wall throughout with very subtle texture, providing safe dark space for a white logo around x12%, y23%. The LOWER 32% must be nearly black cave floor, allowing white website copy around y70–88%; extend the existing floor naturally downward. Maintain spacious black cave roof for navigation. No characters or puppy (the character is a separate website animation), no text, no logos, no new setting, no new objects. This is the SAME environment in a taller composition, not a new creative background. High quality portrait 4:5.”

## Motion references

- https://ui.aceternity.com/components/3d-card-effect — depth and floating layers.
- https://reactbits.dev/animations/animated-content — eased, staggered entry on scroll.
- https://designspells.com/ — restrained interface motion references.

Implemented locally with CSS and the existing Web Animations/IntersectionObserver hook. No animation dependency added.

## Verification scope

Production compilation and TypeScript; existing export, content, motion, media, review and Journal checks; mocked DOM checks of entry, keyboard focus, offscreen mail motion, reduced-motion switching and cleanup. Browser playback and physical device rendering are unavailable in this workspace and have not been visually verified.

The release ZIP contains one versioned project folder. All website assets and original source artwork from 0.4.6 are retained. Duplicate `out/assets` copies are prepared from `public/assets` automatically on first preview launch; rebuild normally for a complete deployment export. The archive is CRC-tested, extracted, and checked again after downloading the saved release.
