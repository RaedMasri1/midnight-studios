# Editable game pages

Each record in `content/games.json` supplies `/games/[slug]`. Duplicate a complete record, choose a unique lowercase hyphenated slug, and replace the text and assets. Use `publication: "draft"` while preparing it, then `"published"` to include it in routes and lists. Rebuild after changes.

Keep the existing catalogue fields alongside the new `page`, `stores` and `platforms` fields. `image` is catalogue artwork; `page.icon` is the app icon; `page.screenshots` is the detail-page gallery. Existing catalogue values are unchanged in this delivery.

| Field | Editable content |
| --- | --- |
| `page.developer`, `pitch`, status labels | Attribution, lead copy, coming-soon/released labels |
| `page.icon` | Optional source, dimensions, alt text and optional crop |
| Gallery text fields | Title, intro and empty state |
| `page.screenshots` | Any number of ordered sources, dimensions, alt text, captions, kinds and responsive variants |
| Overview fields | Heading and any number of paragraphs |
| `page.highlights` | Repeatable feature titles, copy and optional characters/progression/platforms icons |
| Review and feedback fields | Section visibility, title, empty state, labels, placeholder, policy and unavailable notice |
| `page.signInUrl` | Future same-origin sign-in path, currently null |
| `page.footerText` | Footer supporting text |
| `platforms` | Actual platforms for structured data |
| `stores` | Independent release flags, official URLs and API identifiers |

Put images in `public/assets/`, using lowercase hyphenated filenames. Supply actual dimensions and descriptive alt text. Screenshot kind is `gameplay` or `concept`; concept artwork uses a wide layout and must be clearly captioned. The build validates all records.

An uncropped icon record:

```json
{"src":"/assets/my-game-icon.png","width":1024,"height":1024,"alt":"My Game app icon"}
```

Just Jump!'s icon source was an iPhone home-screen screenshot. The record-controlled crop selects the correct icon at x324, y184, width128, height128 within the original 517-square source. Replace it with the original high-resolution app icon when available; the current low-resolution source cannot provide a truly sharp 1024px icon.

## Release controls

Download buttons require game `status: "Released"`, individual store `released: true`, and that store's official HTTPS URL. Apple must use apps.apple.com; Google must use play.google.com. Coming-soon games have no buttons. A released store on an in-development game fails validation. Either store can release independently.

Review imports additionally need the Apple numeric appId or Google packageName and private authorization outside the content records.

## Future dashboard

Replace shared getters in `lib/content.ts` with a server-side CMS/database reader returning the same validated shape. Use repeatable screenshots, paragraphs and features, not first/second-game fields. Preserve unique slugs and publication controls. Static publication triggers a rebuild; live content and visitor writes require a server-backed Next.js deployment.
