# Public launch and search visibility

Version 0.4.9 includes a search-ready production export for `https://www.midnightstudios.app`. This task has not published it.

1. Confirm your final public domain. `.env.production` contains the existing HTTPS canonical origin and `SITE_INDEXABLE=true`. Change the origin if necessary, then run `npm run build` and `npm run check`. Remove unintended localhost overrides from `.env.local` before a public build.
2. Deploy the complete generated `out/` folder to a static host with HTTPS and extensionless URL support. A normal build copies assets into `out/assets`. The download stores shared images once in `public/assets`; `Start-Preview.bat`/`npm start` prepare that copy automatically. If uploading the included export directly, first run `node --input-type=module -e "import {preparePreviewAssets} from './scripts/prepare-preview.mjs'; await preparePreviewAssets();"` from the project folder.
3. Check public HTTP responses, `/robots.txt` (Allow), `/sitemap.xml` (eleven published URLs), canonical links and the absence of hosting-level noindex headers. Keep a real 404; redirect old equivalent paths and alternate domains to the canonical URLs.
4. Verify the domain in Google Search Console and Bing Webmaster Tools and submit `/sitemap.xml` from the owner's account. Search engines and social crawlers need a publicly reachable URL; localhost is only for local review.
5. Check desktop, tablet and phone layouts, anchor navigation, game scrolling, keyboard access and reduced-motion behavior in a browser. Browser QA was unavailable for this delivery; automated checks do not verify rendering.
6. Run PageSpeed Insights and structured-data validation on the deployed URL. Build byte budgets are not load times or real Core Web Vitals.
7. Publish useful development stories, link from official studio profiles, and keep game status and store links accurate. See `docs/seo-049.md` for changes and search limitations.

For private review, build with `SITE_INDEXABLE=false` (PowerShell: `$env:SITE_INDEXABLE='false'; npm run build; npm run check`). Remove that environment override or set it to `true` before rebuilding for launch. Recognized Vercel/Netlify preview environments automatically disable indexing. Noindex is not access control; use host authentication for confidential reviews.

No search ranking, indexing date, rich result, FPS or performance score is guaranteed. The website uses CSS perspective and scroll-transformed images with a bounded canvas sequence for Idle Chaos; it does not ship a WebGL renderer. A future CMS requires a server runtime or a static rebuild after publication. Never ship secret API credentials in public source or output.
