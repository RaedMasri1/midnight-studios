import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const gameRecords=JSON.parse(fs.readFileSync('content/games.json','utf8')).filter(r=>r.publication==='published');
const postRecords=JSON.parse(fs.readFileSync('content/posts.json','utf8')).filter(r=>r.publication==='published');
const routes=['/','/games','/about','/devlog','/contact',...gameRecords.map(r=>'/games/'+r.slug),...postRecords.map(r=>'/devlog/'+r.slug)];
const titles=new Set(),descriptions=new Set();
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const origin=(process.env.SITE_URL||'https://www.midnightstudios.app').replace(/\/$/,'');
const previewDeployment=process.env.VERCEL_ENV==='preview'||['deploy-preview','branch-deploy'].includes(process.env.CONTEXT??'');
const indexable=process.env.SITE_INDEXABLE==='true'&&!previewDeployment;
for(const route of routes){
 const html=fs.readFileSync(route==='/'?'out/index.html':'out'+route+'.html','utf8');
 const tags=[...html.matchAll(/<(a|img|script|meta|link)\b([^>]*?)>/g)].map(m=>({tag:m[1],...attrs(m[2])}));
 assert.equal([...html.matchAll(/<h1\b/g)].length,1,route+' H1');
 const title=html.match(/<title>([^<]+)<\/title>/)?.[1];assert.ok(title&&!titles.has(title),route+' unique title');titles.add(title);
 const description=tags.find(t=>t.tag==='meta'&&t.name==='description')?.content;assert.ok(description&&!descriptions.has(description),route+' unique description');descriptions.add(description);
 assert.equal(tags.find(t=>t.tag==='link'&&t.rel==='canonical')?.href.replace(/\/$/,''),origin+route.replace(/\/$/,''),route+' canonical');
 assert.equal(tags.find(t=>t.tag==='meta'&&t.name==='robots')?.content.includes('noindex'),!indexable,route+' indexing');
 for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs))JSON.parse(match[1]);
 for(const tag of tags){
  if(tag.tag==='img')assert.ok(Object.hasOwn(tag,'alt'),route+' image alt');
  const value=tag.tag==='a'?tag.href:['img','script'].includes(tag.tag)?tag.src:undefined;
  if(!value?.startsWith('/')||value.startsWith('//'))continue;
  const url=value.split(/[?#]/)[0];if(!url)continue;
  const file='out'+decodeURIComponent(url);
  assert.ok([file,file+'.html',path.join(file,'index.html')].some(f=>fs.existsSync(f)&&fs.statSync(f).isFile()),route+' internal target '+url);
 }
}
const robots=fs.readFileSync('out/robots.txt','utf8'),sitemap=fs.readFileSync('out/sitemap.xml','utf8');
assert.ok(robots.includes(indexable?'Allow: /':'Disallow: /'));
assert.equal([...sitemap.matchAll(/<loc>/g)].length,indexable?routes.length:0);
console.log(`PASS: ${routes.length} exported pages, unique metadata, canonical/H1/schema, alt attributes, internal targets, ${indexable?'public':'private'} robots/sitemap.`);
