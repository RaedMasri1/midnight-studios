import {readFile,writeFile,rename,mkdir,stat,unlink} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {contentSnapshotSchema} from '../lib/content-schema.ts';
import {homeSchema} from '../lib/home-schema.ts';
import {reviewSchema} from '../lib/game-page-schema.ts';
const base=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!base||!key)throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local or hosting build settings.');
const url=new URL(base);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Use the HTTPS Supabase project URL.');
const result=await fetch(new URL('/rest/v1/cms_publication?id=eq.true&select=snapshot',url),{headers:{apikey:key},signal:AbortSignal.timeout(30000),redirect:'error'});
if(!result.ok)throw new Error('Publication fetch failed: HTTP '+result.status);
const rows=await result.json();if(rows.length!==1)throw new Error('Initialize the studio content from /admin first.');
const raw=rows[0].snapshot,data=contentSnapshotSchema.parse(raw),home=homeSchema.parse(raw.home),reviews=z.array(reviewSchema).parse(raw.reviews);
const published=new Set(data.games.filter(g=>g.publication==='published').map(g=>g.slug));
for(const feature of [home.feature,home.secondaryFeature])if(feature.enabled&&!published.has(feature.gameSlug))throw new Error('Enabled homepage game is missing: '+feature.gameSlug);
for(const chapter of home.upcomingChapters)if(!published.has(chapter.gameSlug))throw new Error('Homepage scene game is missing: '+chapter.gameSlug);
if(reviews.some(r=>!published.has(r.gameSlug)))throw new Error('Review refers to a missing published game.');
const assets=new Set();function collect(v){if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(['src','image'].includes(k)&&typeof x==='string'&&x.startsWith('/assets/'))assets.add(x);else collect(x);}}collect({home,...data});
await mkdir('public/assets',{recursive:true});
for(const src of assets){
 const destination=path.resolve('public','.'+src);
 if(!destination.startsWith(path.resolve('public/assets')+path.sep))throw new Error('Invalid asset path');
 if((await stat(destination).catch(()=>null))?.isFile())continue;
 if(!/^\/assets\/admin-[a-f0-9-]+\.(png|jpg|webp)$/.test(src))throw new Error('Missing original website asset: '+src);
 const response=await fetch(new URL('/storage/v1/object/public/studio-media/'+src.slice(8),url),{redirect:'error',signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error('Image download failed: '+src);
 const bytes=Buffer.from(await response.arrayBuffer());if(!bytes.length||bytes.length>52428800)throw new Error('Invalid image size: '+src);
 const valid=src.endsWith('.png')?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):src.endsWith('.jpg')?bytes[0]===255&&bytes[1]===216:bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(!valid)throw new Error('Unexpected image format: '+src);
 await writeFile(destination,bytes);console.log('Downloaded original image '+path.basename(src)+' ('+createHash('sha256').update(bytes).digest('hex').slice(0,12)+')');
}
const staged=[];
try{for(const [name,value] of [['games',data.games],['posts',data.posts],['home',home],['reviews',reviews]]){const destination=path.resolve('content',name+'.json'),temporary=destination+'.pending';await writeFile(temporary,JSON.stringify(value,null,2)+'\n');staged.push({temporary,destination});}for(const f of staged)await rename(f.temporary,f.destination);}finally{for(const f of staged)await unlink(f.temporary).catch(()=>{});}
console.log('Imported published Supabase content and original images. Run npm run build to generate the website.');
