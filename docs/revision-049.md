# Revision 0.4.9

## Requested changes

1. Just Jump! uses **In development** in the homepage badge, Games collection and individual game page. Other games retain their existing labels; no release date was added.
2. All five homepage artwork captions now share the same size, weight and line height, with muted colors chosen for each section's background. Just Jump!'s large black caption is corrected.
3. The supplied cat-head PNG is used only for favicon/Apple icon assets. Its oversized black margins were trimmed and it was proportionally resampled onto square black icon canvases; the mark was not redrawn. The original site logo and Organization identity remain unchanged.
4. The studio section cancels the global 112px desktop/96px phone anchor clearance because it is a full-viewport stage with its own heading clearance. The “Meet the studio” link still targets the semantic `#studio` section and retains native hash navigation. Other page anchors retain their existing clearance.
5. Order is **Just Jump!, Dreamward, Tadri, Break the Heel!, Idle Chaos** on the homepage and Games collection, including cover links and structured list data. Desktop copy sides are right, left, right, left, right. The heel background veil now protects the left-side copy. Tablet/phone layouts retain copy above art and existing two-entry tablet grouping on the Games page.
6. Search metadata, production indexing and social sharing are described in `docs/seo-049.md`. The existing canonical domain is `https://www.midnightstudios.app`; confirm it before publication. An original sharing card is included only in metadata, not rendered as page content. See `docs/social-image-049.md` for its source and final generation prompt.

## Validation

- Production build and TypeScript pass; all project checks pass.
- A Vercel-preview build/check confirms private robots and empty sitemap. The final included export is a public production build with eleven sitemap entries.
- Export checks cover unique metadata, canonical/H1/schema, alt attributes and internal targets across eleven content routes. New release checks cover order, alternation, status, social metadata, favicon references and original identity.
- Existing reversible motion, card/player clearance, sequence cache, all 192 sequence files, content/media schemas, Journal and mocked store-review adapter checks pass.
- All 285 previous files under `public` and all 22 previous files under `design-assets` are preserved byte-for-byte. Journal records are unchanged. No dependencies were added or removed.
- Generated JavaScript: 325538 bytes gzip across all routes; homepage entry scripts: 209464 bytes gzip including the legacy polyfill. Both remain within existing budgets. These are file-size estimates, not measured load times.
- Browser rendering, responsive composition, actual anchor landing and device performance could not be visually tested here. No browser, Lighthouse, FPS or live indexing claim is made.

## Download layout

One ZIP, one top-level `Midnight-Studios-v0.4.9` folder. It contains source, original artwork, production assets, and the built export. Shared artwork is stored once under `public/assets`; the preview launcher prepares the `out/assets` copy before serving. Dependency installations and rebuild caches are excluded. A standard Windows-compatible ZIP and `RELEASE-SHA256.json` support integrity checks.

Extract once and open that folder. With Node.js 22.13+ installed, double-click `Start-Preview.bat`, leave its window open, and visit **http://localhost:3049**. The version endpoint is **http://localhost:3049/__version**. To use VS Code, open this version's folder and run `npm install`, then `npm run dev -- --port 3049`. Close an older server if that port is already occupied.
