import fs from 'node:fs';
import assert from 'node:assert/strict';
import { postSchema } from '../lib/content-schema.ts';
import { homeSchema } from '../lib/home-schema.ts';
import { selectJournal } from '../lib/journal.ts';

const posts=JSON.parse(fs.readFileSync('content/posts.json','utf8')).map(post=>postSchema.parse(post));
const home=homeSchema.parse(JSON.parse(fs.readFileSync('content/home.json','utf8')));
const seed=posts[0];assert(seed,'The delivery fixture includes the actual published article');
const {showOnHomepage,category,...legacy}=seed;
assert.equal(postSchema.parse(legacy).showOnHomepage,true);
assert.equal(postSchema.parse(legacy).category,'Development');
assert.equal(postSchema.safeParse({...seed,showOnHomepage:'yes'}).success,false);
assert.equal(homeSchema.safeParse({...home,journal:{...home.journal,homepageLimit:0}}).success,false);
assert.equal(homeSchema.parse({...home,journal:{...home.journal,postSlug:null}}).journal.postSlug,null);
assert.equal(homeSchema.parse({...home,journal:{...home.journal,enabled:false}}).journal.enabled,false);

const records=[
 {...seed,slug:'older',publishedAt:'2026-01-01T00:00:00Z'},
 {...seed,slug:'newest',publishedAt:'2026-10-15T00:00:00Z'},
 {...seed,slug:'homepage-hidden',showOnHomepage:false,publishedAt:'2026-10-14T00:00:00Z'},
 {...seed,slug:'draft',publication:'draft',showOnHomepage:true,publishedAt:'2026-10-16T00:00:00Z'},
 {...seed,slug:'undated',publishedAt:undefined},
];
const before=JSON.stringify(records);
assert.deepEqual(selectJournal([]).items,[]);
assert.deepEqual(selectJournal([records[2]],{homepage:true}).items,[]);
assert.equal(selectJournal([records[2]]).featured.slug,'homepage-hidden');
assert.equal(selectJournal(records,{homepage:true,featuredSlug:'homepage-hidden'}).featured.slug,'newest');
assert.equal(selectJournal(records,{homepage:true,featuredSlug:'draft'}).featured.slug,'newest');
assert.equal(selectJournal(records,{homepage:true,featuredSlug:'deleted'}).featured.slug,'newest');
assert.deepEqual(selectJournal(records,{homepage:true}).items.map(p=>p.slug),['newest','older','undated']);
const index=selectJournal(records,{featuredSlug:'older'});
assert.deepEqual(index.items.map(p=>p.slug),['older','newest','homepage-hidden','undated']);
assert(!index.remaining.some(p=>p.slug===index.featured.slug));
assert.equal(selectJournal([seed,seed]).items.length,1);
assert.equal(JSON.stringify(records),before,'Selection must not mutate shared CMS records');
for(const count of [0,1,2,3,7,100]){
 const many=Array.from({length:count},(_,i)=>({...seed,slug:`entry-${i}`}));
 const selected=selectJournal(many,{featuredSlug:'entry-4'});
 assert.equal(selected.items.length,count);assert.equal(new Set(selected.items.map(p=>p.slug)).size,count);
 const front=selectJournal(many,{homepage:true,featuredSlug:'entry-4',limit:3});
 assert.equal(front.items.length,Math.min(3,count));assert.equal(front.total,count);
}

const front=selectJournal(posts,{homepage:true,featuredSlug:home.journal.postSlug,limit:home.journal.homepageLimit});
const archive=selectJournal(posts,{featuredSlug:home.journal.postSlug});
const html=fs.readFileSync('out/index.html','utf8'), indexHtml=fs.readFileSync('out/devlog.html','utf8');
const ids=text=>[...text.matchAll(/data-journal-card="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(ids(html),home.journal.enabled?front.items.map(p=>p.slug):[]);
assert.deepEqual(ids(indexHtml),archive.items.map(p=>p.slug));
assert.equal(new Set(ids(indexHtml)).size,ids(indexHtml).length,'Every journal article appears once');
if(archive.items.length===1){assert(!indexHtml.includes('id="more-stories-heading"'));assert(!indexHtml.includes('aria-roledescription="carousel"'));}
for(const page of ['out/index.html','out/games.html','out/devlog.html','out/devlog/the-first-game.html'])assert(fs.readFileSync(page,'utf8').includes('/assets/just-jump-ascent.webp'),page+' updated artwork');
const css=fs.readFileSync('app/journal.module.css','utf8');assert(css.includes('background:#eef1fb'));assert(css.includes('prefers-reduced-motion:reduce'));
assert.equal(home.hero.title,'Imagination never sleeps');
console.log('PASS: CMS homepage visibility, draft safety, deletion fallback, limits, stable order, unique0–100article selections, single-article index, shared art and exact subtitle.');
