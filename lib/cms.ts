import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {contentSnapshotSchema,gameSchema,postSchema,type GameRecord,type PostRecord} from './content-schema.ts';
import {homeSchema} from './home-schema.ts';
import {reviewSchema} from './game-page-schema.ts';
import {z} from 'zod';
export type CmsDocument={id:string;kind:'game'|'post';slug:string;data:GameRecord|PostRecord;sort_order:number;revision:number;updated_at:string};
export const publicationSchema=contentSnapshotSchema.and(z.object({home:homeSchema,reviews:z.array(reviewSchema)}));
let client:SupabaseClient|undefined;
export function getCmsClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 if(key.startsWith('sb_secret_'))throw new Error('Use the publishable key, never a secret key.');
 return client??=(createClient(url,key,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}}));
}
export function mediaUrl(src:string){
 if(!src.startsWith('/assets/admin-'))return src;
 return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studio-media/${src.slice(8)}`;
}
export function validateDocument(row:CmsDocument){return (row.kind==='game'?gameSchema:postSchema).parse(row.data);}
export function validatePublication(rows:CmsDocument[],home:unknown,reviews:unknown){
 return publicationSchema.parse({games:rows.filter(r=>r.kind==='game'&&r.data.publication==='published').sort((a,b)=>a.sort_order-b.sort_order).map(r=>r.data),posts:rows.filter(r=>r.kind==='post'&&r.data.publication==='published').map(r=>r.data),home,reviews});
}
export function formatError(error:unknown){if(error instanceof z.ZodError)return error.issues.map(i=>`${i.path.join(' → ')}: ${i.message}`).join('\n');return error instanceof Error?error.message:typeof error==='object'&&error&&'message'in error?String(error.message):'The action could not be completed.';}
