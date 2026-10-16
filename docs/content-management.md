> v0.6.0 update: the dashboard and Supabase integration are now included. Start with [START-DASHBOARD.md](../START-DASHBOARD.md). Live cloud/store/hosting connections still need configuration; the notes below describe the earlier frontend phase.

# Content and future dashboard

The frontend reads one validated content snapshot. Its UI does not depend on a fixed article count. The same published article records drive the homepage Journal, Journal index, static article routes, metadata and sitemap. The homepage and index share `app/journal.tsx`; editorial content does not define card geometry or animation.

| Content | Source / schema | Dashboard integration |
| --- | --- | --- |
| Homepage copy, feature selections and approved art | `content/home.json`, `lib/home-schema.ts` | Editable relevant fields while keeping the composition/motion code fixed |
| Games and original screenshots | `content/games.json`, `lib/content-schema.ts`, `lib/game-page-schema.ts` | Add published games, edit details, replace media, set release links |
| Articles | `content/posts.json`, `lib/content-schema.ts` | Create, edit, draft, publish and delete records |
| Media | `lib/media-schema.ts` | Upload images and publish their local asset paths/dimensions/alt text |
| Data access | `lib/content.ts`, `ContentRepository` | Replace the data source or use the included CMS snapshot bridge |

`hero.title` is the accessible main heading and must match `hero.lines.join(' ')`. The supplied headline is “Imagination never sleeps”; its small supporting label is “Independent mobile game development studio.” followed on a separate line by “Care in every detail.”. `hero.environment` is the existing desktop scene. Optional `hero.mobileEnvironment` supplies a portrait source at widths up to 700px; older snapshots without it retain their desktop fallback. Preserve the dark logo/copy areas and the separate puppy layer when replacing this artwork.

## Article contract

Each record contains a unique URL slug; publication (`draft` or `published`); title and card/SEO titles; summary and lead; optional UTC ISO `publishedAt`; linked game slug; image or video-cover media; and structured article blocks. Existing articles do not receive invented publication dates. Blocks support headings, paragraphs, notes, quotes and the existing investment figures. Plain text is escaped by React; arbitrary HTML is not accepted.

A published article automatically enters the Journal index and receives `/devlog/<slug>` on the next build. Drafts are omitted from public routes and lists. Setting `showOnHomepage` to false hides an article only from the homepage; its index listing, detail page and sitemap entry remain available.

| Field | Editorial behavior |
| --- | --- |
| `posts[].publication` | `draft` or `published`; only published records appear publicly |
| `posts[].showOnHomepage` | Homepage eligibility; defaults to true for older records |
| `posts[].category` | Editorial category; defaults to Development |
| `posts[].publishedAt` | Optional UTC ISO publication date; dated records sort newest first, undated records follow in source order |
| `posts[].title`, `cardTitle`, `summary`, `lead`, `body` | Article and card text; shared components handle the layout |
| `posts[].media` | Validated image or video with a cover; include dimensions, alt text and responsive sources |
| `home.journal.enabled` | Shows or hides the entire homepage Journal section |
| `home.journal.postSlug` | Preferred homepage feature, or null to use the newest eligible article |
| `home.journal.homepageLimit` | Total homepage cards including the feature; integer from 1 to 6, default 3 |
| `home.journal.eyebrow`, `title`, `subtitle`, `featuredLabel` | Section and feature labels |

If the preferred article is deleted, drafted or hidden from the homepage, selection falls back to the newest eligible published article. The index prefers the same configured featured slug among published records, falling back to its newest published article. Homepage-only visibility does not restrict index selection. Selection deduplicates by slug, and the featured item is removed from the remaining cards. Zero eligible homepage articles hide the section; an empty index displays an empty state. One article displays once without a second listing or carousel. Additional articles use the same grid and card component. Card height adapts to editorial copy. New records need no additional frontend code.

## Optional CMS bridge

The future CMS exposes a JSON endpoint with this shape:

```json
{
  "home": { "...": "same shape as content/home.json" },
  "games": ["same records as content/games.json"],
  "posts": ["same records as content/posts.json"]
}
```

These strings are explanatory placeholders for this contract, not a valid import payload. Use the actual supplied records as the starting schema.

Set `CONTENT_API_URL` to that HTTPS endpoint and optionally `CONTENT_API_TOKEN` in `.env.local` or CI secrets. The token is used only by the build-time script, never shipped to the visitor. `npm run content:pull` fetches with a timeout, validates the entire snapshot and local asset references, stages the JSON files, then writes them. Invalid data or missing images prevents import before writing.

The dashboard publish job should upload/copy images into `public/assets/`, run `npm run content:pull`, run `npm run build && npm run check`, then deploy the resulting `out/`. Publish builds should run in an isolated checkout so a failed build leaves the last live site intact. An image replacement uses a new filename to avoid stale caches.

This keeps the current frontend intact while the dashboard manages records in a database. Because this edition is a static export, content publication requires a rebuild. It is not a runtime CMS or an upload backend. If immediate server-rendered content becomes a requirement, remove static export and provide a server repository; the section components and animation geometry can be retained.

## Layout invariants

Book hinge geometry, cutout atlas cells, hero camera movement, tablet proportions and the About artwork crop belong to the frontend. The About artwork should be replaced only with matching composition/dimensions. Do not let the dashboard reorder book fragments or insert arbitrary illustration layers without an asset preparation step.

Before implementing the dashboard, select authentication, database, image storage and deployment/build triggers. Those systems belong to the later dashboard phase; this package includes their content contract and frontend support, not an admin application.

See `docs/journal-authoring-plan.md` for the planned dashboard controls corresponding to the existing article heading, quotation and investment screenshots. No dashboard code has been added.
