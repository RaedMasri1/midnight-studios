import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chapterProgress,gameProgress,cinematicPose,craftStage,jumpProgress,heroProgress,heroFollow} from '../lib/cinematic-motion.ts';
for(const viewport of [480,589,600,620,740,844,900,1080]){
 const height=viewport*2.8;
 assert.equal(chapterProgress(0,height,viewport,true),0);
 assert.equal(chapterProgress(-(height-viewport),height,viewport,true),1);
 assert.equal(chapterProgress(viewport,height,viewport,false),0);
 assert.equal(chapterProgress(-height,height,viewport,false),1);
}
// Game motion is already advancing when the art arrives. It remains bounded,
// reaches the complete scene at release, and reverses on the same scroll path.
for(const viewport of [480,620,844,900,1180])for(const height of [viewport*1.6,viewport*2,viewport*2.3]){
 assert.equal(gameProgress(viewport,height,viewport),0);
 assert(gameProgress(0,height,viewport)>0);
 assert.equal(gameProgress(-(height-viewport),height,viewport),1);
 const positions=Array.from({length:201},(_,i)=>viewport-(height+viewport)*i/200);
 const forward=positions.map(top=>gameProgress(top,height,viewport));
 assert.deepEqual(forward,[...positions].reverse().map(top=>gameProgress(top,height,viewport)).reverse());
 assert(forward.every((p,i)=>p>=0&&p<=1&&(!i||p>=forward[i-1])));
}
for(const kind of ['hero','jump','dream','craft','journal','footer','heel','trivia','chaos']){
 const poses=Array.from({length:201},(_,i)=>i/200);
 assert.deepEqual(poses.map(p=>cinematicPose(kind,p)),[...poses].reverse().map(p=>cinematicPose(kind,p)).reverse());
 for(const p of [-100,0,.5,1,100,NaN,Infinity])for(const value of Object.values(cinematicPose(kind,p)))assert(Number.isFinite(parseFloat(value)));
 // Large discontinuities indicate a jump in a hinge or a scroll frame.
 for(let i=1;i<poses.length;i++)for(const [key,value] of Object.entries(cinematicPose(kind,poses[i])))assert(Math.abs(parseFloat(value)-parseFloat(cinematicPose(kind,poses[i-1])[key]))<6,key+' discontinuity');
}
const closed=cinematicPose('dream',0),open=cinematicPose('dream',1);
assert.equal(parseFloat(closed['--cover-angle']),180);assert.equal(parseFloat(open['--cover-angle']),0);
for(const layer of ['back','castle','front','cloud']){
 assert.equal(parseFloat(closed['--paper-'+layer]),76);
 assert.equal(parseFloat(closed['--paper-'+layer+'-opacity']),0);
 assert.equal(parseFloat(open['--paper-'+layer+'-opacity']),1);
 assert.equal(parseFloat(cinematicPose('dream',.47)['--paper-'+layer+'-opacity']),0);
 assert.equal(parseFloat(open['--paper-'+layer]),0);
}
assert.equal(parseFloat(cinematicPose('dream',.1)['--cover-angle']),180);
assert.equal(parseFloat(cinematicPose('dream',.49)['--cover-angle']),0);
assert.equal(parseFloat(cinematicPose('dream',.59)['--paper-castle-opacity']),0);
assert.equal(parseFloat(cinematicPose('dream',.68)['--paper-front-opacity']),0);
assert.equal(parseFloat(cinematicPose('dream',.76)['--paper-cloud-opacity']),0);
assert.deepEqual([0,.2,.5,.85,1,.5,0].map(craftStage),[0,0,1,2,2,1,0]);
assert.equal(parseFloat(cinematicPose('craft',0)['--line-one']),0);
assert.equal(parseFloat(cinematicPose('craft',1)['--line-two']),1);
assert.equal(parseFloat(cinematicPose('journal',0)['--journal-card-opacity']),0);
assert.equal(parseFloat(cinematicPose('journal',1)['--journal-card-opacity']),1);
assert.equal(parseFloat(cinematicPose('craft',.3)['--studio-create']),0);
assert.equal(parseFloat(cinematicPose('craft',.5)['--studio-create']),1);
assert.equal(parseFloat(cinematicPose('craft',.69)['--studio-refine']),0);
assert.equal(parseFloat(cinematicPose('craft',.85)['--studio-refine']),1);
assert.equal(jumpProgress(900,1530,900),0);
assert(jumpProgress(860,1530,900)>0);
assert.equal(jumpProgress(0,1530,900,true),.12);
assert(jumpProgress(-100,1530,900,true)>.25);
assert.equal(jumpProgress(-630,1530,900,true),1);
assert(parseFloat(cinematicPose('jump',.01)['--front-x'])<0);
assert.equal(parseFloat(cinematicPose('footer',0)['--footer-opacity']),0);
assert.equal(parseFloat(cinematicPose('footer',1)['--footer-opacity']),1);
assert.equal(cinematicPose('hero',0)['--whiteout'],'0.00000');
assert.equal(cinematicPose('hero',1)['--whiteout'],'1.00000');
// Regression: movement and fades must continue together through the end of the
// pin, including when 100svh is smaller than the live mobile browser viewport.
for(const viewport of [480,589,680,744,844,900,1080])for(const svhRatio of [.85,.94,1]){
 const stage=viewport*svhRatio,height=stage*2,pinEnd=height-stage,forward=[];
 for(let i=0;i<=400;i++){
  const scroll=(height+viewport)*i/400,top=-scroll,nextTop=height-scroll;
  const p=heroProgress(top,height),pose=cinematicPose('hero',p),follow=heroFollow(top,height,stage);
  forward.push({p,pose,follow});
  if(nextTop>=viewport)assert(Number(pose['--whiteout'])<.4,'No blank white screen before next game enters');
  if(Number(pose['--whiteout'])>=.98)assert(nextTop<viewport*.22,'Next game occupies most of the screen before the world is almost gone');
  const stageTop=Math.min(0,height-stage-scroll),stageBottom=stageTop+stage;
  assert(stageBottom<=nextTop+1e-8,'Consecutive sections remain separate');
  if(scroll<=height)assert(Math.abs(stageTop+follow)<1e-8,'Portal follows the native exit inside the stage clip');
  assert(follow>=0&&follow<=stage,'Follow distance is bounded');
 }
 const before=cinematicPose('hero',heroProgress(-pinEnd,height));
 const after=cinematicPose('hero',heroProgress(-pinEnd-stage*.12,height));
 assert(Number(before['--copy-opacity'])<.2,'Text already fades during the main motion');
 assert(Number(before['--puppy-opacity'])>.5,'Character remains visible into the handoff');
 assert(parseFloat(after['--puppy-y'])>parseFloat(before['--puppy-y']),'Character continues its downward tail instead of holding');
 assert(parseFloat(after['--puppy-x'])>parseFloat(before['--puppy-x']),'Character keeps moving after the pin ends');
 assert(Number(after['--portal-scale'])>Number(before['--portal-scale']),'Camera keeps moving after the pin ends');
 assert(Number(after['--puppy-opacity'])<Number(before['--puppy-opacity']),'Character fades while it moves');
 assert(Number(after['--whiteout'])>Number(before['--whiteout']),'Background fades on the same timeline');
 const delta=stage*.001;
 const left=heroProgress(-pinEnd,height)-heroProgress(-pinEnd+delta,height);
 const right=heroProgress(-pinEnd-delta,height)-heroProgress(-pinEnd,height);
 assert(left>0&&right>0&&Math.abs(left-right)<.00001,'No stopped pose or velocity break at sticky release');
 const reversed=Array.from({length:401},(_,i)=>{
  const scroll=(height+viewport)*(400-i)/400,top=-scroll,p=heroProgress(top,height);
  return {p,pose:cinematicPose('hero',p),follow:heroFollow(top,height,stage)};
 }).reverse();
 assert.deepEqual(forward,reversed,'The complete hero transition reverses deterministically');
 for(let i=1;i<forward.length;i++){
  const old=forward[i-1],next=forward[i];
  assert(next.p>=old.p,'Progress is monotonic');
  if(old.p>0&&next.p<1)assert(next.p>old.p,'No progress plateau while visible');
  assert(Math.abs(Number(next.pose['--whiteout'])-Number(old.pose['--whiteout']))<.03,'No opacity jump');
 }
}
// Ordinary short-window/large-type flow remains bounded without the follow layer.
for(const height of [660,700,850])for(const top of [100,0,-200,-height,-height*2]){
 const p=heroProgress(top,height);assert(p>=0&&p<=1);
 for(const value of Object.values(cinematicPose('hero',p)))assert(Number.isFinite(parseFloat(value)));
}
const html=fs.readFileSync('out/index.html','utf8');
assert.equal((html.match(/data-cinematic=/g)||[]).length,9);
assert.equal((html.match(/data-pin="true"/g)||[]).length,7);
assert.equal((html.match(/data-paper="[0-3]"/g)||[]).length,4);
assert(html.includes('data-book-world'));
assert(!html.includes('data-pinned="true"')); // No-JS output has no long empty scroll chapters.
for(const label of ['Imagination','never sleeps','Just Jump!','Play is in the details.','Inside Midnight.','Get in touch.'])assert(html.includes(label),label);
const mainHeading=html.match(/<h1[^>]*id="home-heading"[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g,'').trim();
assert.equal(mainHeading,'Imagination never sleeps');
assert(!html.includes('Made for the joy of play.'));
const heroPicture=html.match(/<picture[^>]*>[\s\S]*?portal-cave-mobile[\s\S]*?<\/picture>/)?.[0];
assert(heroPicture?.includes('media="(max-width: 700px)"'),'Mobile selects its own portrait artwork');
assert(heroPicture?.includes('src="/assets/portal-cave.webp"'),'Desktop retains its original portal artwork');
const desktopPortalPreload=[...html.matchAll(/<link[^>]*rel="preload"[^>]*>/g)].map(m=>m[0]).find(tag=>tag.includes('/assets/portal-cave-960.webp')&&!tag.includes('media='));
assert(!desktopPortalPreload,'The hidden404 boundary must not force a desktop-portal download on mobile');
for(const image of ['portal-cave','hero-puppy','studio-dog','studio-cat','studio-sketch','studio-tools','studio-floor','just-jump-tablet-forest','just-jump-tablet-caves','dream-cutouts'])assert(html.includes(image)||fs.readFileSync('app/homepage.module.css','utf8').includes(image));
const gamePage=fs.readFileSync('out/games/just-jump.html','utf8');
for(const image of ['just-jump-forest','just-jump-crystal-caves'])assert(gamePage.includes(image),'Original phone development screenshots remain in the gallery');
assert.equal((html.match(/data-game-status=/g)||[]).length,5,'Every homepage game has the shared status treatment');
const css=fs.readFileSync('app/homepage.module.css','utf8');
for(const match of css.matchAll(/url\(['"]?(\/assets\/[^)'"\s]+)['"]?\)/g))assert(fs.existsSync('public'+match[1]),match[1]);
assert(!css.includes('approvedArtwork'));
assert(parseFloat(cinematicPose('hero',1)['--portal-scale']) <= 1.12);
assert.equal((html.match(/src="\/assets\/studio-/g)||[]).length,5);
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('PASS: coordinated hero motion/fades, clipped portal follow, sticky-release continuity, scroll endpoints/continuity/reversibility, delayed cover and sequential cutouts, three studio phases, journal reveal, shared Journal entry motion, semantic SSR fallback and independent studio layers.');
