import {z} from 'zod';
const text=z.string().trim().min(1);
export const imageSchema=z.object({
 src:text.regex(/^\/assets\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|svg)$/),
 width:z.number().int().positive(),height:z.number().int().positive(),alt:text,
 caption:text.optional(),fit:z.enum(['cover','contain']).default('cover'),
 position:text.regex(/^(\d{1,3}(\.\d+)?%|left|center|right) (\d{1,3}(\.\d+)?%|top|center|bottom)$/).default('50% 50%'),
 variants:z.array(z.object({src:text.regex(/^\/assets\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g)$/),width:z.number().int().positive()})).optional()
});
const videoUrl=text.url().refine(value=>{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;},'Use a public HTTPS video link');
export const editorialMediaSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('image'),image:imageSchema}),
 z.object({type:z.literal('video'),cover:imageSchema,url:videoUrl})
]);
export type StudioImage=z.infer<typeof imageSchema>;
export type EditorialMedia=z.infer<typeof editorialMediaSchema>;
