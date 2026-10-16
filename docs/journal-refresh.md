# Journal and Just Jump update — version 0.4.2

## Implemented design

The homepage Journal follows the approved image-and-copy composition: a large Inside Midnight heading, outlined View Journal link, vivid illustration on the left and a readable near-white article panel on the right. The background is pale blue-lavender (`#eef1fb`), intentionally a little different from the white About section, with a fine boundary between sections. It does not use a green or mint background. Text, links, images and category labels are native page elements rather than a flattened screenshot.

Heading, artwork and article copy use the existing scroll-driven Journal entry choreography. Keyboard focus completes the reveal, reduced-motion preferences show the finished composition, and content stays visible without JavaScript. Narrow screens stack the illustration above the copy. No new animation runtime was added.

The Journal index uses the same card component. Its featured article is excluded from the remaining grid, so the current single article appears exactly once. The old carousel has been removed. Zero records show an index empty state, one record needs no secondary heading, and additional records reuse a consistent grid.

## Corrected Just Jump artwork

The new illustration depicts upward vertical jumping, with a visibly slimmer upright orange puppy, compact blue boost pack, shallow small platforms and a trail directly beneath the character. The Games collection, Journal cards and Journal article use this artwork. Its original PNG and responsive WebP variants are included. The original gameplay screenshots remain in the homepage tablet showcase and game-detail gallery.

This is labeled promotional concept artwork inspired by gameplay. It is not represented as a game screenshot. `asset-prompts-journal.md` records its prompt and source files. No Higgsfield tool or service was used.

The studio subtitle remains exactly “Imagination never sleeps”. Hero, tablet, book, three Coming soon chapters, About layers and footer retain their existing implementation.

## Dashboard preparation

Validated records now include homepage visibility and category. Homepage settings include section visibility, an optional preferred featured slug and a limit of one to six articles. Hidden homepage entries remain available on the Journal index and article pages; drafts remain private. Deleted or ineligible preferred articles fall back automatically. See `content-management.md` for fields and the existing snapshot bridge.

The dashboard, authentication and upload backend are not included. Publishing through the future dashboard must trigger a static build or provide a server repository. Article creation itself does not require new frontend components.

## Verification completed

- Production build and TypeScript: passed.
- Export checks: eleven application routes, metadata, internal links, image references and sitemap checks passed.
- Journal selection: visibility, drafts, feature fallbacks, ordering, deduplication, limits and zero/one/two/three/seven/one hundred article cases passed.
- Built HTML: article uniqueness and corrected artwork references passed on the homepage, Games collection, Journal index and article.
- Existing motion, media/content schemas, mocked review adapters, three game chapters and sequence checks: passed.
- Delivery budgets: home entry JavaScript 204.8 KiB gzip; all-route JavaScript 318.3 KiB gzip. These are compressed byte estimates, not measured load times or frame rates.

Browser-control tooling was unavailable in this managed environment. This revision has not been visually verified in a browser or on physical devices. The generated artwork was visually inspected; automated checks do not establish responsive composition or scroll smoothness. Earlier browser reports are historical.

## Open the included result

Extract the complete ZIP, open `midnight-studios`, then double-click `Start-Preview.bat` with Node.js 22.13 or newer installed. Visit http://localhost:3000 while its terminal remains open. The included `out/` folder is already built and needs no npm install for preview. Review the Journal after About, `/devlog/`, `/devlog/the-first-game/` and `/games/` at desktop and mobile widths.
