# Favicon contrast

The client screenshot shows the white cat icon disappearing against Chrome's light tab bar. Browser icon selection should follow the browser or operating system preference rather than the website's dark page design.

- The existing 96px/192px PNGs and multi-size ICO now use the black cat on transparency as the default. These remain available to search crawlers and browsers without theme selection.
- White `favicon-dark` PNG/ICO alternatives are selected with `media="(prefers-color-scheme: dark)"`. Both themes include the ICO's 16/32/48/64px sizes.
- The exact original outline, alpha values, and eye/nose/mouth cutouts are preserved. The existing unlinked SVG source now has a black fill. The Apple home-screen icon and on-page studio logo are unchanged.
- Browser favicon metadata uses the one-time `20261023` revision to refresh the previous cached white icon. No client-side JavaScript, database changes, or external scripts are needed.

Validation: production build and TypeScript, exported-page icon references and media restrictions, existing release checks, pixel comparison of the PNG alpha masks and colours, and all four embedded ICO sizes. Small-size previews were inspected on light and dark backgrounds.

Search engines control their own result appearance and favicon refresh schedule. Their independent page-theme switches cannot be controlled by the website. Google may take days or weeks to recrawl a changed icon: https://developers.google.com/search/docs/appearance/favicon-in-search

Next.js supports conditional icon metadata through its `media` property; see the installed `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` icon examples.
