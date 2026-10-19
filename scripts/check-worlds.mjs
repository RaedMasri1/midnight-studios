import fs from 'node:fs';
import assert from 'node:assert/strict';
import {worldPose,triviaTilePose,triviaLayout,sequenceFrame,closestFrame,frameWindow,DecodedFrameCache} from '../lib/world-motion.ts';
import {homeSchema} from '../lib/home-schema.ts';
const home=homeSchema.parse(JSON.parse(fs.readFileSync('content/home.json','utf8')));
const games=JSON.parse(fs.readFileSync('content/games.json','utf8'));
assert.equal(home.hero.title,'Imagination never sleeps');
assert.deepEqual(home.upcomingChapters.map(c=>c.kind),['trivia','heel','chaos']);
assert.equal(homeSchema.safeParse({...home,upcomingChapters:[home.upcomingChapters[0],home.upcomingChapters[0]]}).success,false);
for(const chapter of home.upcomingChapters){
 const game=games.find(game=>game.slug===chapter.gameSlug);
 assert(game&&game.publication==='published');assert.equal(game.page.statusLabel,'Coming soon');
 assert.equal(game.page.reviewsEnabled,false);assert(!game.stores.appStore.released&&!game.stores.googlePlay.released);
 assert(game.page.screenshots.every(s=>s.kind==='concept'));
 const samples=Array.from({length:401},(_,i)=>i/400);
 const forward=samples.map(p=>worldPose(chapter.kind,p));
 const backward=[...samples].reverse().map(p=>worldPose(chapter.kind,p)).reverse();
 for(let i=0;i<samples.length;i++)assert.deepEqual(forward[i],backward[i],`Reversible ${chapter.kind} pose at ${samples[i]}`);
 for(const p of [-2,0,.3,.5,1,3,NaN,Infinity])for(const v of Object.values(worldPose(chapter.kind,p)))assert(Number.isFinite(parseFloat(v)));
 for(let i=1;i<forward.length;i++)for(const k of Object.keys(forward[i]))assert(Math.abs(parseFloat(forward[i][k])-parseFloat(forward[i-1][k]))<3,'Discontinuous '+k);
}
assert.equal(parseFloat(worldPose('heel',0)['--break-a']),0);
assert.equal(parseFloat(worldPose('heel',.3)['--break-a']),0);
assert.equal(parseFloat(worldPose('heel',.5)['--break-c']),0);
assert.equal(parseFloat(worldPose('heel',1)['--break-c']),1);
assert(parseFloat(worldPose('heel',.28)['--heel-y'])<parseFloat(worldPose('heel',.6)['--heel-y']));
for(let index=0;index<4;index++)for(let i=0;i<=100;i++){
 const pose=triviaTilePose(index,i/100);for(const v of Object.values(pose))assert(Number.isFinite(v));
 assert(Math.abs(pose.x)<=30&&Math.abs(pose.y)<=32);
}
// Actual 31×10 end-state cards have a clear gutter.
const firstAnswer=triviaTilePose(0,1),lastAnswer=triviaTilePose(2,1);
assert(lastAnswer.y-firstAnswer.y+1e-9>=13);
assert(triviaTilePose(1,1).x-firstAnswer.x+1e-9>=34);
// Check the entire moving card envelope, including yaw, rotation, side depth and
// perspective, rather than checking only the final (small) answer rectangles.
// Coordinates use art-width units; card depth uses pixels, matching the renderer.
let minimumPlayerGap=Infinity,minimumCardTop=Infinity,maximumCardBottom=-Infinity;
for(const width of [200,240,280,320,390,480,600,800,1000])for(let sample=0;sample<=1000;sample++){
 const p=sample/1000,m=Number(worldPose('trivia',p)['--answer-phase']),unit=width/100;
 const tileWidth=23+8*m,tileHeight=23-13*m,originY=50/triviaLayout.aspect;
 for(let index=0;index<4;index++){
  const pose=triviaTilePose(index,p),turn=pose.turn*Math.PI/180,yaw=pose.yaw*Math.PI/180;
  for(const x of [-tileWidth/2,tileWidth/2])for(const y of [-tileHeight/2,tileHeight/2])for(const z of [-.8,.1]){
   const sideY=z<0?.65:0;
   const yawX=x*Math.cos(yaw)+z*Math.sin(yaw),yawZ=-x*Math.sin(yaw)+z*Math.cos(yaw);
   const rotatedY=yawX*Math.sin(turn)+(y+sideY)*Math.cos(turn);
   const projectedY=originY+(triviaLayout.anchorY+pose.y+rotatedY-originY)*1100/(1100-pose.z-yawZ*unit);
   minimumPlayerGap=Math.min(minimumPlayerGap,triviaLayout.playersTop-projectedY);
   minimumCardTop=Math.min(minimumCardTop,projectedY);maximumCardBottom=Math.max(maximumCardBottom,projectedY);
  }
 }
}
assert(minimumPlayerGap>3.5,`Moving category cards must clear players throughout scroll: ${minimumPlayerGap}cqw`);
assert(minimumCardTop>1&&maximumCardBottom<triviaLayout.playersTop-3.5,'Moving category cards fit inside their reserved area');
assert(triviaLayout.playersTop+triviaLayout.playerHeight+triviaLayout.playerRise<100/triviaLayout.aspect,'Player reveal fits inside the scene');
// Regression: illustrated sprites must fit even during the card-to-answer morph.
for(let i=0;i<=1000;i++){
 const pose=worldPose('trivia',i/1000),m=Number(pose['--answer-phase']);
 const faceHeight=23-13*m,iconSize=18.4-12*m;
 if(Number(pose['--topic-icon-opacity'])>0)assert(faceHeight*.03+iconSize<=faceHeight,'Category icon exceeds shrinking card');
 assert(!(Number(pose['--topic-icon-opacity'])>0&&Number(pose['--answer-label-opacity'])>0),'Category illustration overlaps answer label');
}
const jump=games.find(game=>game.slug==='just-jump');
assert(jump.card.width/jump.card.height>1.6,'The Games cover must use landscape artwork');
assert(jump.card.caption.toLowerCase().includes('concept'),'Promotional artwork is disclosed');
assert(jump.page.screenshots.every(s=>s.kind==='gameplay'),'Original gameplay gallery is retained');
for(const p of [-2,0,.01,.5,1,5,NaN,Infinity])assert(sequenceFrame(p,96)>=0&&sequenceFrame(p,96)<96);
assert.equal(sequenceFrame(0,96),0);assert.equal(sequenceFrame(1,96),95);
assert.equal(closestFrame(70,[3,22,69,90]),69);assert.equal(closestFrame(0,[]),undefined);
let closed=0;const cache=new DecodedFrameCache(12);
for(let i=0;i<96;i++){cache.set(i,{close(){closed++;}},i);assert(cache.size<=12);}
assert.equal(closed,84);assert(cache.has(95));assert.equal(closestFrame(90,cache.keys()),90);
cache.set(0,{close(){closed++;}},0);assert(cache.has(0));assert.equal(cache.size,12);
cache.clear();assert.equal(cache.size,0);assert.equal(closed,97);
assert.throws(()=>new DecodedFrameCache(0));
// Rapid seeks must retain a representative of every phase without exceeding
// the decoded-memory cap, so the end storm cannot be evicted by the calm intro.
const anchors=new Set([0,24,48,71,95]),buffer=new DecodedFrameCache(8,anchors);
for(const index of anchors)buffer.set(index,{},index);
for(let index=1;index<95;index++){buffer.set(index,{},index);assert(buffer.size<=8);for(const anchor of anchors)assert(buffer.has(anchor));}
assert.equal(closestFrame(95,buffer.keys()),95);
assert.throws(()=>new DecodedFrameCache(5,anchors));
assert.deepEqual(frameWindow(0,96),[0,1,2,3,4,5]);assert.deepEqual(frameWindow(95,96,-1),[95,94,93,92,91,90]);
// The shipped continuous render has every frame and an independent mobile set.
const manifest=JSON.parse(fs.readFileSync('public/assets/idle-chaos-frames/scene.json','utf8'));
assert.equal(manifest.frameCount??manifest.count,96);
assert(manifest.version>=2&&manifest.revision,'Regenerated sequences need a cache revision');
assert(fs.existsSync('public'+manifest.poster));
for(let i=0;i<96;i++)for(const base of ['public/assets/idle-chaos-frames','public/assets/idle-chaos-frames/mobile'])assert(fs.statSync(`${base}/${String(i).padStart(3,'0')}.webp`).size>1000);
const html=fs.readFileSync('out/index.html','utf8');
for(const chapter of home.upcomingChapters){assert(html.includes(`id="world-${chapter.gameSlug}"`));assert(html.includes(`/games/${chapter.gameSlug}`));}
assert.equal((html.match(/data-trivia-tile=/g)||[]).length,4);
assert.equal((html.match(/data-player-avatar=/g)||[]).length,4);
assert(html.includes('/assets/heel-district-desktop.webp'));
assert.equal((html.match(/data-cinematic="(?:heel|trivia|chaos)"/g)||[]).length,3);
assert(!html.includes('data-pinned="true"'));
const css=fs.readFileSync('app/new-worlds.module.css','utf8');
for(const m of css.matchAll(/url\(['"]?(\/assets\/[^)'"\s]+)['"]?\)/g))assert(fs.existsSync('public'+m[1]));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('top:var(--trivia-anchor)')&&css.includes('top:var(--players-top)'),'Shared scene geometry must drive card and avatar placement');
console.log(`PASS: three CMS-backed coming-soon chapters, reversible poses, heel timing, full-scroll trivia clearance (${minimumPlayerGap.toFixed(2)}cqw minimum across nine widths), frame caches, 192 frames and SSR fallback.`);
