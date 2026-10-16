# Pages that match the homepage

Games (the listing), About, Contact, Journal and journal articles now use the homepage's visual language: Manrope typography, generous scale and spacing, original vivid illustrations, warm cream accents, rounded pill controls, light/dark sections, complete-image entrances and the cratered lunar footer with pause/resume controls. The fallback page also uses this design.

The homepage retains its approved composition and motion. Its arrows, buttons and footer are now shared components. The motion controller resets on route navigation so header contrast and the animated footer remain correct when moving between pages.

The individual Just Jump! and Dreamward pages retain their existing source and appearance. A before/after rendered-pixel comparison confirmed identical first viewports for each game at 1440×900 and 390×844, with reduced motion enabled for a stable comparison.

## Preview screenshots

Open a screenshot for the complete page. Phone previews appear beside the desktop version.

| Page | Desktop | Phone |
| --- | --- | --- |
| Games listing | [Preview](review/pages/games-desktop.webp) | [Preview](review/pages/games-phone.webp) |
| About | [Preview](review/pages/about-desktop.webp) | [Preview](review/pages/about-phone.webp) |
| Contact | [Preview](review/pages/contact-desktop.webp) | [Preview](review/pages/contact-phone.webp) |
| Journal | [Preview](review/pages/devlog-desktop.webp) | [Preview](review/pages/devlog-phone.webp) |
| Journal article | [Preview](review/pages/devlog-the-first-game-desktop.webp) | [Preview](review/pages/devlog-the-first-game-phone.webp) |

### Games listing

![Games desktop preview](review/pages/games-desktop.webp)

### About

![About desktop preview](review/pages/about-desktop.webp)

### Contact

![Contact desktop preview](review/pages/contact-desktop.webp)

### Journal

![Journal desktop preview](review/pages/devlog-desktop.webp)

## Validation

- Production build and TypeScript, the six project checks and ESLint completed successfully. ESLint reports image optimization recommendations without errors.
- Five content routes checked in Chromium at seven sizes: desktop, wide desktop, short desktop, portrait tablet, landscape tablet, phone and small phone. Headings remain below the masthead; horizontal overflow, missing images and runtime errors were checked.
- Animated lunar surface and pause/resume controls verified on every page at every size.
- Reduced-motion and no-JavaScript reading checked on all five routes.
- Navigation from Home → About → Games listing → Just Jump! → Home verified, including restoration of the homepage animation and correct header contrast.
- The existing homepage browser runner passed all ten viewport sizes plus its motion/no-JavaScript fallbacks.
- Results are recorded in `review/inner-pages-results.json` and `review/browser-results.json`. These are Chromium viewport simulations, not physical-device Safari tests.

The ZIP includes current source and the production export in `out/`, plus the established preview launchers. All artwork remains local; no new production dependency was added.
