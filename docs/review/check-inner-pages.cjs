/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser review. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sharp=require('sharp');
const output=process.env.REVIEW_DIR||'/workspace/review/page-design';
const url=process.env.TEST_URL||'http://127.0.0.1:3002';
const routes=['/games','/about','/contact','/devlog','/devlog/the-first-game'];
const sizes=[['desktop',1440,900],['wide-desktop',1900,1080],['short-desktop',1366,600],['tablet',820,1180],['tablet-landscape',1024,768],['phone',390,844],['small-phone',320,740]];
async function run(){
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const results=[];
 try{
  for(const [name,width,height] of sizes){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of routes){
    assert.equal((await page.goto(url+route)).status(),200);
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(()=>document.querySelector('[data-cinematic=footer]')?.dataset.motionReady==='true');
    await page.waitForTimeout(1050);
    assert.equal(await page.locator('h1').count(),1);
    const geometry=await page.evaluate(()=>{
     const h=document.querySelector('h1').getBoundingClientRect();
     const header=document.querySelector('.site-header').getBoundingClientRect();
     return {overflow:document.documentElement.scrollWidth>innerWidth+1,h1:{left:h.left,right:h.right,top:h.top},headerBottom:header.bottom};
    });
    assert(!geometry.overflow,`${route} ${name}: horizontal overflow`);
    assert(geometry.h1.left>=-1&&geometry.h1.right<=width+1,`${route} ${name}: heading clipping`);
    assert(geometry.h1.top>=geometry.headerBottom-1,`${route} ${name}: heading behind navigation`);
    const active=route.startsWith('/devlog')?'Journal':route==='/games'?'Games':route==='/about'?'About':'Contact';
    if(width>=1024)assert.equal(await page.locator('.desktop-nav [aria-current=page]').innerText(),active);
    if(route==='/about'||route.startsWith('/devlog'))assert(await page.locator('.site-header').evaluate(e=>e.classList.contains('on-light')),`${route}: light masthead`);
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=height*.8){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(50);}
    await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
    await page.waitForTimeout(500);
    await page.locator('[data-moon] img').evaluate(img=>img.decode());
    assert.equal(await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).animationPlayState),'running');
    const start=await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).transform);
    await page.waitForTimeout(250);
    assert.notEqual(await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).transform),start,`${route} ${name}: moon static`);
    await page.getByRole('button',{name:'Pause moon animation'}).click();
    await page.locator('[data-moon-drift]').evaluate(async e=>{await Promise.all(e.getAnimations().map(a=>a.ready));});
    const paused=await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).transform);
    await page.waitForTimeout(150);
    assert.equal(await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).transform),paused);
    await page.getByRole('button',{name:'Resume moon animation'}).click();
    const broken=await page.locator('img').evaluateAll(images=>images.filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src));
    assert.deepEqual(broken,[],`${route} ${name}: missing artwork`);
    if(name==='desktop'||name==='phone'){
     const slug=route.replaceAll('/','-').slice(1);
     await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);
     await page.screenshot({path:`${output}/${slug}-${width}-hero.png`});
     await page.screenshot({path:`${output}/${slug}-${width}-full.png`,fullPage:true});
    }
    results.push({route,viewport:name,width,height,overflow:false,headingVisible:true,moonMotion:true,pauseResume:true,artworkLoaded:true});
   }
   if(width<1024){await page.getByRole('button',{name:'Open studio menu'}).click();assert(await page.getByRole('dialog').isVisible());await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});}
   assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${name}: all 5 pages, footer motion, navigation and artwork`);
  }
  for(const mode of [{name:'reduced-motion',reducedMotion:'reduce',javaScriptEnabled:true},{name:'no-javascript',reducedMotion:'no-preference',javaScriptEnabled:false}]){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:mode.reducedMotion,javaScriptEnabled:mode.javaScriptEnabled});
   for(const route of routes){await page.goto(url+route);assert(await page.locator('h1').isVisible());assert(await page.locator('#main').evaluate(e=>e.scrollWidth<=innerWidth+1));assert.equal(await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).animationName),'none');}
   results.push({mode:mode.name,pages:5,readable:true,staticMoon:true});await page.close();console.log(`PASS ${mode.name}`);
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await page.locator('.desktop-nav').getByRole('link',{name:'About',exact:true}).click();await page.waitForURL('**/about');
  await page.waitForFunction(()=>document.querySelector('.site-header')?.classList.contains('on-light'));
  await page.locator('.desktop-nav').getByRole('link',{name:'Games',exact:true}).click();await page.waitForURL('**/games');
  await page.waitForFunction(()=>!document.querySelector('.site-header')?.classList.contains('on-light'));
  await page.getByRole('link',{name:'Discover the game',exact:true}).first().click();await page.waitForURL('**/games/just-jump');
  assert.equal(await page.locator('[data-studio-page]').count(),0);
  assert.equal(await page.locator('.site-header.home-masthead').count(),0);
  await page.getByRole('link',{name:'Midnight Studios homepage',exact:true}).first().click();await page.waitForURL(url+'/');
  await page.waitForFunction(()=>document.querySelector('[data-cinematic=hero]')?.dataset.motionReady==='true');
  assert.equal(await page.locator('[data-cinematic]').count(),6);assert.deepEqual(errors,[]);
  results.push({navigation:'home → about → games → Just Jump → home',mastheadReset:true,homepageMotionRestored:true});await page.close();
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'});
   for(const slug of ['just-jump','dreamward']){
    await page.goto(url+'/games/'+slug);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
    const target=`${output}/game-after-${slug}-${width}.png`;await page.screenshot({path:target,fullPage:true});
    const baseline=`${output}/game-before-${slug}-${width}.png`;
    if(fs.existsSync(baseline)){
     const h=width===1440?900:844;
     const before=await sharp(baseline).extract({left:0,top:0,width,height:h}).raw().toBuffer();
     const after=await sharp(target).extract({left:0,top:0,width,height:h}).raw().toBuffer();
     assert(before.equals(after),`${slug} ${width}: existing game page appearance changed`);
     results.push({excludedGame:slug,width,unchangedViewportPixels:true});
    }
   }await page.close();
  }
  fs.writeFileSync(`${output}/inner-pages-results.json`,JSON.stringify(results,null,2));
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1);});
