> v0.6.0 update: the dashboard and Supabase integration are now included. Start with [START-DASHBOARD.md](../START-DASHBOARD.md). Live cloud/store/hosting connections still need configuration; the notes below describe the earlier frontend phase.

# Journal authoring through the future dashboard

This is an explanation and future implementation plan. No dashboard, editor, authentication, database or publishing backend has been built in this revision.

## How the existing article is designed

The current article is not one long string with manually styled fragments. It stores typed blocks in `content/posts.json`. `lib/content-schema.ts` validates them, and the shared `ArticleBlock` renderer in `app/devlog/[slug]/page.tsx` gives each type its consistent appearance. Article spacing, divider lines, colors, number formatting and responsive typography belong to the frontend.

| Screenshot element | What the future admin would do | What the website handles |
| --- | --- | --- |
| “A simple beginning” and following paragraphs | Add a Heading block, enter its title, then add Paragraph blocks | Heading size, paragraph color, spacing, line wrapping and section separation |
| Large closing quotation with a vertical line | Add a Quote block and type the quote, with optional line breaks | Quotation marks, large type, left rule and responsive spacing |
| Paid/committed/projected financial rows | Add a Development costs block, enter a caption and the two amounts | Currency formatting, emphasized numbers, row labels and dividers; projected total is calculated from the two amounts |
| Smaller editorial note | Add a Note block | The established note style |
| Article title, summary, date, cover image/video and linked game | Fill the article's normal fields and select/upload media | Header, cover, journal cards, date formatting, links and metadata |

For example, the admin enters `79396.84` as the paid amount and `12000` as committed development. The existing renderer automatically displays `$79,396.84`, `$12,000.00` and the `$91,396.84` total in the designed rows. They do not need to type HTML, dollar formatting, font sizes or divider lines.

## Proposed editing experience

The dashboard should offer **Add block**, then Heading, Paragraph, Quote, Note, or Development costs. The admin can edit, reorder and remove blocks, preview the finished article, save a draft, and publish. New journals reuse these same components; they do not require a new coded page. An optional “Start from this article” template can prefill the block sequence without copying its factual text or figures into a published article.

The content structure and renderer already support the five current body block types. The editing controls and publishing workflow are future work. Current paragraph blocks are plain text; inline bold, italic, links, lists or additional custom blocks would require adding a controlled rich-text format and its renderer during the dashboard phase. They should not rely on unrestricted HTML or per-article font/color choices.

## Publishing

The website currently exports static pages. A future Publish action must save the content, validate it, trigger a build/check and deploy the successful output. The previous live version should stay available if a build fails. The dashboard needs authentication, media storage, a content store and a build/deployment trigger; the current optional snapshot bridge is a data contract, not an existing admin product. See `docs/content-management.md`.
