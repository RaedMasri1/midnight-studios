import {writeFile,rename,unlink,stat} from 'node:fs/promises';
import path from 'node:path';
import {contentSnapshotSchema} from '../lib/content-schema.ts';
import {homeSchema} from '../lib/home-schema.ts';
const endpoint=process.env.CONTENT_API_URL;
if(!endpoint)throw new Error('Set CONTENT_API_URL to the CMS snapshot endpoint. See docs/content-management.md.');
const url=new URL(endpoint);
if(url.protocol!=='https:'||url.username||url.password)throw new Error('CMS endpoint must be HTTPS, without credentials in its URL.');
const headers=process.env.CONTENT_API_TOKEN?{Authorization:`Bearer ${process.env.CONTENT_API_TOKEN}`} : {};
const response=await fetch(url,{headers,redirect:'error',signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`CMS snapshot returned HTTP ${response.status}`);
const raw=await response.json();
const data=contentSnapshotSchema.parse(raw),home=homeSchema.parse(raw.home);
const publishedGames=new Set(data.games.filter(g=>g.publication==='published').map(g=>g.slug));
for(const section of [home.feature,home.secondaryFeature])if(section.enabled&&!publishedGames.has(section.gameSlug))throw new Error('Enabled homepage feature references an unpublished or missing game.');
for(const chapter of home.upcomingChapters)if(!publishedGames.has(chapter.gameSlug))throw new Error('Upcoming chapter references an unpublished or missing game.');
// Uploads must arrive in the build's public/assets directory before publication.
const sources=new Set();
function collect(value){if(!value||typeof value!=='object')return;for(const [key,item] of Object.entries(value)){if(['src','image'].includes(key)&&typeof item==='string'&&item.startsWith('/assets/'))sources.add(item);else collect(item);}}
collect({home,...data});
for(const src of sources){const file=path.resolve('public','.'+src);const info=await stat(file).catch(()=>null);if(!info?.isFile())throw new Error('Missing CMS image asset: '+src);}
const staged=[];
try{
 for(const [name,value] of [['games',data.games],['posts',data.posts],['home',home]]){const destination=path.resolve('content',name+'.json');const temporary=destination+'.pending';await writeFile(temporary,JSON.stringify(value,null,2)+'\n');staged.push({temporary,destination});}
 for(const {temporary,destination} of staged)await rename(temporary,destination);
 console.log(`Imported validated CMS snapshot: ${data.games.length} games, ${data.posts.length} articles. Run npm run build to publish.`);
}finally{for(const {temporary} of staged)await unlink(temporary).catch(()=>{});}
