import {z} from 'zod';
import {imageSchema,editorialMediaSchema} from './media-schema.ts';
import {gamePageSchema,storesSchema} from './game-page-schema.ts';

const text=z.string().trim().min(1);
const slug=text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const image=text.regex(/^\/assets\/[a-z0-9-]+\.(webp|png|jpe?g)$/);
const publication=z.enum(['draft','published']);
const feature=z.object({title:text,text});
export const gameSchema=z.object({
 slug,publication,name:text,genre:text,schemaGenre:text,description:text,
 className:z.enum(['jump','dream','neutral']),image,imageWidth:z.number().int().positive(),imageHeight:z.number().int().positive(),imageAlt:text,
 status:z.enum(['In development','Released']),seoDescription:text,detailHeading:text,
 detailParagraphs:z.array(text).min(1),features:z.array(feature).min(1),availability:text,
 page:gamePageSchema,stores:storesSchema,platforms:z.array(text).min(1),card:imageSchema.optional()
});
export const articleBlockSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('heading'),text}),z.object({type:z.literal('paragraph'),text}),
 z.object({type:z.literal('note'),text}),z.object({type:z.literal('quote'),lines:z.array(text).min(1)}),
 z.object({type:z.literal('investment'),label:text,paid:z.number().nonnegative(),committed:z.number().nonnegative()}),
 z.object({type:z.literal('richtext'),text}),
 z.object({type:z.literal('image'),image:imageSchema}),
 z.object({type:z.literal('list'),items:z.array(text).min(1),ordered:z.boolean().default(false)}),
 z.object({type:z.literal('divider')})
]);
export const postSchema=z.object({
 slug,publication,title:text,cardTitle:text,seoTitle:text,seoDescription:text,summary:text,lead:text,
 showOnHomepage:z.boolean().default(true),category:text.default('Development'),
 image,imageWidth:z.number().int().positive(),imageHeight:z.number().int().positive(),imageAlt:text,imageCaption:text,projectedInvestment:z.number().nonnegative().optional(),investmentCaption:text.optional(),
 media:editorialMediaSchema.optional(),gameSlug:slug.optional(),
 publishedAt:z.string().datetime().optional(),
 body:z.array(articleBlockSchema).min(1)
});
export type GameRecord=z.infer<typeof gameSchema>;
export type PostRecord=z.infer<typeof postSchema>;

export const contentSnapshotSchema=z.object({games:z.array(gameSchema),posts:z.array(postSchema)}).superRefine((snapshot,ctx)=>{
 for(const [kind,records] of [['games',snapshot.games],['posts',snapshot.posts]] as const){
  const unique=new Set<string>();
  for(const record of records){
   if(unique.has(record.slug))ctx.addIssue({code:'custom',path:[kind],message:'Duplicate slug: '+record.slug});
   unique.add(record.slug);
  }
 }
 for(const post of snapshot.posts)if(post.gameSlug&&!snapshot.games.some(g=>g.slug===post.gameSlug))ctx.addIssue({code:'custom',path:['posts'],message:'Unknown linked game: '+post.gameSlug});
 for(const game of snapshot.games){
  if(game.status!=='Released'&&(game.stores.appStore.released||game.stores.googlePlay.released))ctx.addIssue({code:'custom',path:['games'],message:'Store releases require Released game status: '+game.slug});
  for(const image of [game.page.icon,...game.page.screenshots])if(image?.crop&&(image.crop.x+image.crop.width>image.width||image.crop.y+image.crop.height>image.height))ctx.addIssue({code:'custom',path:['games'],message:'Image crop exceeds bounds: '+game.slug});
 }
});
