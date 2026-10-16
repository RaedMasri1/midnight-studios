# Homepage content

Edit `content/home.json` for approved homepage copy, game selections, hero environment/character, About reference art and featured journal slug. The schema is `lib/home-schema.ts`.

Articles belong in `content/posts.json`; all published entries enter the homepage story reel and journal index automatically. Do not add another frontend section for each article. Optional publication dates use an ISO UTC timestamp, for example `2026-10-11T12:00:00Z`; examples are formatting guidance, not dates assigned to existing articles.

Images need a local asset path, dimensions and descriptive alt text. Optional responsive variants include path and width. Video records need a thumbnail image and a public HTTPS video URL. No autoplay video is added.

See `content-management.md` for the future dashboard contract and the existing CMS import script. Complex motion geometry remains in code while its relevant copy and imagery live in validated content.
