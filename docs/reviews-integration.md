> v0.6.0 update: the dashboard and Supabase integration are now included. Start with [START-DASHBOARD.md](../START-DASHBOARD.md). Live cloud/store/hosting connections still need configuration; the notes below describe the earlier frontend phase.

# Official store imports and future visitor reviews

The frontend has no authentication, review database or write endpoint. Visitor drafts remain in component state, disappear on navigation/reload and are never transmitted. The sign-in button opens an honest unavailable notice. Setting the reserved `page.signInUrl` alone does not implement submission.

## API setup

The CLI reads official authorized developer APIs, never scrapes store pages or fetches credentials in a visitor browser. Website reviews are not published back to the stores.

Official references:

- https://developer.apple.com/documentation/appstoreconnectapi/get-v1-apps-_id_-customerreviews
- https://developer.apple.com/documentation/appstoreconnectapi/generating-tokens-for-api-requests
- https://developers.google.com/android-publisher/reply-to-reviews
- https://developers.google.com/android-publisher/api-ref/rest/v3/reviews/list
- https://developers.google.com/identity/protocols/oauth2/service-account

Set game status to Released and configure individually released stores, official URLs, Apple appId and/or Google packageName. Obtain authorized short-lived tokens through each official authentication workflow. Set APP_STORE_CONNECT_TOKEN and/or GOOGLE_PLAY_ACCESS_TOKEN in `.env.local` or your server secret manager. Never commit that file or use NEXT_PUBLIC_ variables.

```sh
pnpm reviews:sync
# Optional: one game only
pnpm reviews:sync just-jump
pnpm build
```

Node 22.13+ loads `.env.local` for this command. Imports follow pagination, normalize UTC timestamps, validate all records and stage all selected imports before one atomic cache replacement. Errors abort without overwriting the cache. Apple imports replace that game's App Store cache with the complete returned set. Google imports upsert by game/source/review ID, preserving older cache records. Both coming-soon games currently skip all requests.

Google returns written production reviews created or modified within the preceding week, not rating-only entries. Historical initialization requires a Play Console export normalized separately; a CSV importer is not included. Schedule authorized imports at least weekly when live; token refresh and scheduling belong to the backend phase. Incremental Google results cannot reconcile all historic source deletions, so add periodic cache maintenance. The displayed average is calculated only from cached written reviews, not the store-wide rating.

No live import was verified because released store IDs and developer credentials were unavailable. Included tests mock pagination, failed requests, untrusted Apple pagination links, source normalization, update deduplication and historic Google retention.

## Later visitor-review backend

Authenticate users and enforce a database unique constraint on `(game_id, user_id)` for one website review per account per game. Allow updating that row. LocalStorage, cookies and IP addresses cannot reliably enforce this requirement. The frontend cannot prove someone played: choose self-attestation or actual in-game account linkage in the backend phase.

Validate session, game, rating 1–5 and bounded plain text server-side. Store moderation state and timestamps, displaying only published reviews. Add appropriate rate limits and session/CSRF protection. Label website reviews separately from imported store identities. Replace `lib/reviews.ts` with a server-backed reader and implement authenticated write routes in the later authorized phase.
