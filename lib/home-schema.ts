import { z } from 'zod';
import { imageSchema } from './media-schema.ts';
const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const homeSchema = z.object({
  hero: z.object({ title: text, subtitle: text.optional(), lines: z.array(text).min(1).max(3), description: text, primaryLabel: text, secondaryLabel: text, scrollLabel: text, exhibitionGameSlugs: z.array(slug).max(2), environment: imageSchema, mobileEnvironment: imageSchema.optional(), tabletEnvironment: imageSchema.optional(), character: imageSchema }),
  gamesTitle: text, catalogueLabel: text,
  feature: z.object({ enabled: z.boolean(), gameSlug: slug, title: text, description: text, linkLabel: text, mediaLabel: text, progressLabel: text, tabletScreenshots: z.array(imageSchema).length(2).optional() }),
  secondaryFeature: z.object({ enabled: z.boolean(), gameSlug: slug, description: text, linkLabel: text, progressLabel: text, scene: imageSchema }),
  upcomingChapters: z.array(z.object({ gameSlug: slug, kind: z.enum(['heel', 'trivia', 'chaos']), headline: text, conceptLabel: text, linkLabel: text, phases: z.tuple([text, text, text]) })).default([]),
  studio: z.object({ title: text, paragraphs: z.array(text).min(1), linkLabel: text, progressLabel: text, artwork: imageSchema, process: z.array(z.object({ title: text, description: text, image: imageSchema, treatment: z.enum(['study', 'colour']).default('colour') })).min(1).max(3) }),
  journal: z.object({ enabled: z.boolean().default(true), eyebrow: text.default('The studio journal'), title: text, subtitle: text, postSlug: slug.nullable().default(null), homepageLimit: z.number().int().min(1).max(6).default(3), featuredLabel: text.default('Featured story'), description: text, imageLinkLabel: text, videoLinkLabel: text, catalogueLabel: text }),
  contact: z.object({ label: text, title: text, linkLabel: text }),
}).superRefine((home, context) => {
  if (home.hero.title !== home.hero.lines.join(' ')) context.addIssue({ code: 'custom', path: ['hero', 'lines'], message: 'Hero lines must match the accessible page title.' });
  if (new Set(home.upcomingChapters.map(chapter => chapter.gameSlug)).size !== home.upcomingChapters.length) context.addIssue({ code: 'custom', path: ['upcomingChapters'], message: 'A game can only have one homepage chapter.' });
});
