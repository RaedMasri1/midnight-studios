import assert from 'node:assert/strict';
import fs from 'node:fs';
const home=fs.readFileSync('out/index.html','utf8');
const intro=home.match(/<p[^>]*class="[^"]*brandSubtitle[^"]*"[^>]*>([\s\S]*?)<\/p>/)?.[1];
assert(intro,'Hero introduction exists');
assert.deepEqual([...intro.matchAll(/<span>([^<]+)<\/span>/g)].map(m=>m[1]),['Independent mobile game development studio.','Care in every detail.']);
const scenes=[...home.matchAll(/<section\b([^>]*data-game-scene="([^"]+)"[^>]*)>([\s\S]*?)<\/section>/g)];
assert.deepEqual(scenes.map(m=>m[2]),['jump','dream','trivia','heel','chaos']);
assert.deepEqual(scenes.map(m=>m[1].match(/data-copy-side="([^"]+)"/)[1]),['right','left','right','left','right']);
assert.match(scenes[0][3],/data-game-status="true">In development<\/span>/);
assert(!scenes[0][3].includes('Coming soon'));
assert(scenes.every(m=>m[3].includes('data-scene-meta')));
const gameRecords=JSON.parse(fs.readFileSync('content/games.json','utf8'));
assert.deepEqual(gameRecords.map(g=>g.slug),['just-jump','dreamward','tadri','break-the-heel','idle-chaos']);
const collection=fs.readFileSync('out/games.html','utf8');
const features=[...collection.matchAll(/<section\b[^>]*aria-labelledby="game-([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(features,gameRecords.map(g=>g.slug));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const tags=[...home.matchAll(/<(meta|link)\b([^>]*?)>/g)].map(m=>({tag:m[1],...attrs(m[2])}));
const meta=key=>tags.find(t=>t.property===key||t.name===key)?.content;
const share=meta('og:image');
assert(share?.endsWith('/assets/midnight-studios-social-050.jpg'));
assert.equal(meta('og:image:width'),'1200');assert.equal(meta('og:image:height'),'630');
assert.equal(meta('og:image:type'),'image/jpeg');assert.equal(meta('twitter:image'),share);
assert.equal(meta('twitter:card'),'summary_large_image');assert(meta('og:image:alt'));
assert.equal(meta('description'),'Midnight Studios is an independent game development studio in Doha, Qatar, creating mobile games. Explore our games, worlds, and development stories.');
assert(!/<img\b[^>]*src="[^"]*midnight-studios-social/.test(home),'Sharing image is metadata only');
for(const route of ['index','games','about','devlog','contact',...gameRecords.map(g=>'games/'+g.slug)]){
 const html=fs.readFileSync('out/'+route+'.html','utf8');
 for(const name of ['favicon-96.png','favicon-192.png','favicon.ico','favicon-dark-96.png','favicon-dark-192.png','favicon-dark.ico','apple-touch-icon.png']){
  const version=name==='apple-touch-icon.png'?'050':'20261023';
  assert(html.includes('href="/'+name+'?v='+version+'"'));assert(fs.existsSync('out/'+name));
  if(name.endsWith('.png'))assert.equal(fs.readFileSync('out/'+name)[25],6,'Favicon PNG retains RGBA transparency');
 }
 const icons=[...html.matchAll(/<link\b([^>]*?)>/g)].map(m=>attrs(m[1])).filter(t=>t.rel==='icon');
 for(const name of ['favicon-96.png','favicon-192.png','favicon.ico']){
  assert(icons.some(t=>t.href==='/'+name+'?v=20261023'&&!t.media),'Black favicon remains the default');
 }
 for(const name of ['favicon-dark-96.png','favicon-dark-192.png','favicon-dark.ico']){
  assert(icons.some(t=>t.href==='/'+name+'?v=20261023'&&t.media==='(prefers-color-scheme: dark)'),'White favicon is limited to dark browser themes');
 }
 assert(!html.includes('href="/favicon.svg"'));
}
const schema=[...home.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].flatMap(m=>JSON.parse(m[1]));
assert.equal(schema.find(s=>s['@type']==='WebSite').name,'Midnight Studios');
assert(schema.find(s=>s['@type']==='Organization').logo.url.endsWith('/assets/logo.svg'),'Organization retains original studio logo');
assert.equal(fs.readFileSync('out/assets/midnight-studios-social-050.jpg')[0],0xff);
console.log('PASS: requested game order and alternating sides, Just Jump status, social card metadata, favicon-only cat mark, and original organization identity.');
