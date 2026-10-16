import {z} from 'zod';
const text=z.string().trim().min(1);
export const assetPath=z.string().regex(/^\/assets\/[a-z0-9-]+\.(webp|png|jpg|jpeg|svg)$/);
const crop=z.object({x:z.number().nonnegative(),y:z.number().nonnegative(),width:z.number().positive(),height:z.number().positive()});
export const pageImage=z.object({src:assetPath,width:z.number().int().positive(),height:z.number().int().positive(),alt:text,crop:crop.optional()});
const storeUrl=(host:string)=>z.string().url().refine(value=>{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host},'Use the official HTTPS store URL');
export const storesSchema=z.object({
 appStore:z.object({released:z.boolean(),url:storeUrl('apps.apple.com').nullable(),appId:z.string().regex(/^\d+$/).nullable()}),
 googlePlay:z.object({released:z.boolean(),url:storeUrl('play.google.com').nullable(),packageName:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)+$/).nullable()})
}).superRefine((stores,ctx)=>{for(const [key,store] of Object.entries(stores)){if(store.released&&!store.url)ctx.addIssue({code:'custom',path:[key,'url'],message:'A released store needs its official download URL'});}});
export const gamePageSchema=z.object({
 developer:text,pitch:text,statusLabel:text,availableStatusLabel:text,icon:pageImage.optional(),galleryTitle:text,galleryIntro:text,
 screenshots:z.array(pageImage.extend({caption:text,kind:z.enum(['gameplay','concept']),variants:z.array(z.object({src:assetPath,width:z.number().int().positive(),height:z.number().int().positive()})).optional()})),
 overviewTitle:text,overviewParagraphs:z.array(text).min(1),
 highlights:z.array(z.object({title:text,text,icon:z.enum(['characters','progression','platforms']).optional()})).min(1),
 reviewsEnabled:z.boolean(),reviewsTitle:text,reviewsEmptyTitle:text,reviewsEmptyText:text,
 feedbackLabel:text,feedbackPlaceholder:text,reviewPolicy:text,reviewUnavailableTitle:text,reviewUnavailableText:text,
 signInUrl:z.string().regex(/^\/(?!\/)[a-zA-Z0-9_/?=&%-]+$/).nullable(),footerText:text,galleryEmptyText:text
});
export const reviewSchema=z.object({
 id:text,gameSlug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),source:z.enum(['app-store','google-play','website']),
 author:text,rating:z.number().int().min(1).max(5),title:z.string().max(300).default(''),body:text.max(10000),
 publishedAt:z.string().datetime(),language:z.string().max(30).optional()
});
export type GamePageImage=z.infer<typeof pageImage>;
export type ReviewRecord=z.infer<typeof reviewSchema>;
