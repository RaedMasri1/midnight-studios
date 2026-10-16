/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser runner; not part of the website bundle. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = process.env.REVIEW_DIR || '/workspace/review/luxury-motion';
const url = process.env.TEST_URL || 'http://127.0.0.1:3002';
fs.mkdirSync(output, { recursive: true });
async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const results = [];
  const sizes = [
    ['desktop',1900,884,1],['scaled-desktop',1267,589,1.5],['standard-desktop',1440,900,1],
    ['short-desktop',1366,600,1],['wide-desktop',1920,1080,1],
    ['tablet',820,1180,1],['tablet-landscape',1024,768,1],['small-tablet',768,1024,1],
    ['phone',390,844,1],['small-phone',320,740,1]
  ];
  for (const [name,width,height,deviceScaleFactor] of sizes) {
    const page = await browser.newPage({ viewport: { width,height },deviceScaleFactor });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    assert.equal((await page.goto(url)).status(),200);
    await page.waitForFunction(() => document.querySelector('[data-cinematic=hero]')?.dataset.motionReady === 'true');
    await page.waitForTimeout(350);
    assert.equal(await page.locator('[data-cinematic]').count(),6);
    const scene = kind => page.locator(`[data-cinematic=${kind}]`);
    async function scroll(kind,p) {
      await scene(kind).evaluate((e,p) => {
        const rect = e.getBoundingClientRect(), absoluteTop = rect.top + scrollY;
        const stage = e.querySelector('[data-stage]');
        const y = e.dataset.cinematic === 'jump'
          ? e.dataset.pinned === 'true' ? p<=.12 ? absoluteTop-innerHeight+p/.12*innerHeight : absoluteTop+(p-.12)/.88*(rect.height-stage.clientHeight) : absoluteTop-innerHeight+p*(rect.height+innerHeight*.35)
          : e.dataset.pinned === 'true'
          ? absoluteTop + p * (rect.height - stage.clientHeight)
          : absoluteTop - (.85 * innerHeight - p * (rect.height + .35 * innerHeight));
        scrollTo({top:y,behavior:'instant'});
      },p);
      await page.waitForTimeout(kind==='craft'?1050:430);
    }
    const value = (kind,key) => scene(kind).evaluate((e,key) => parseFloat(e.style.getPropertyValue(key)),key);
    const capture = (kind,phase) => page.screenshot({ path:`${output}/${name}-${kind}-${phase}.png` });
    const hero = scene('hero');
    assert.equal(await hero.getAttribute('data-pinned'),'true',`${name}: hero must animate before leaving`);
    await scroll('hero',0);
    const initialHero = await value('hero','--puppy-y');
    await scroll('hero',.45);
    assert(await value('hero','--portal-scale') > 1.025);
    assert(await value('hero','--portal-scale') <= 1.12);
    assert(await value('hero','--copy-opacity') > .95);
    assert(await value('hero','--puppy-y') < initialHero - 25);
    assert(Math.abs(await hero.locator('[data-stage]').evaluate(e=>e.getBoundingClientRect().top))<1.5);
    if(['scaled-desktop','desktop'].includes(name)) await capture('hero','middle');
    const jump = scene('jump');
    await scroll('jump',.025);
    assert(await value('jump','--front-x')<-.2,`${name}: devices must react during entry`);
    assert(await value('jump','--rear-x')>.2);
    for(const p of [0,.3,.7,1]) {
      await scroll('jump',p);
      const geometry = await jump.evaluate(e => {
        const boxes = [...e.querySelectorAll('figure')].map(n=>n.getBoundingClientRect());
        const copy = e.querySelector('h2').parentElement.getBoundingClientRect();
        const stacked = innerWidth<=1100;
        return { stacked, gap:stacked ? copy.top-Math.max(...boxes.map(r=>r.bottom)) : copy.left-Math.max(...boxes.map(r=>r.right)) };
      });
      assert(geometry.gap>=16,`${name}: tablets need clearance from text at ${p}, gap=${geometry.gap}`);
    }
    if(['tablet','tablet-landscape'].includes(name)) {await scroll('jump',.5);await capture('jump','middle');}
    const dream = scene('dream');
    assert.equal(await dream.getAttribute('data-pinned'),'true',`${name}: closed book needs an arrival interval`);
    assert.equal(await dream.locator('[data-paper]').count(),4);
    await scroll('dream',0);
    assert(await dream.locator('[data-book-cover]').evaluate(e=>[...e.children].every(n=>n.scrollWidth<=n.clientWidth+1&&n.offsetLeft>=0&&n.offsetLeft+n.offsetWidth<=e.clientWidth+1&&n.offsetTop+n.offsetHeight<=e.clientHeight+1)),`${name}: cover lettering must stay within its frame`);
    const bookRange = await dream.evaluate(e=>e.offsetHeight-e.querySelector('[data-stage]').clientHeight);
    await page.mouse.wheel(0,Math.round(bookRange*.08));
    await page.waitForTimeout(430);
    assert(await value('dream','--cover-angle')>179.99,`${name}: first wheel must retain closed cover`);
    for(const p of [0,.08,.32,.49,.56,.68,.82,1]) {
      await scroll('dream',p);
      const angle = await value('dream','--cover-angle');
      if(p<=.08) assert(angle>179.99);
      if(p===.32) assert(angle>1&&angle<179);
      if(p>=.49) assert(angle<.01);
      if(p<=.49) for(const layer of ['back','castle','front','cloud']) assert.equal(await value('dream',`--paper-${layer}-opacity`),0);
      if(p===.56) { assert(await value('dream','--paper-back-opacity')>.2);assert.equal(await value('dream','--paper-castle-opacity'),0); }
      if(p===1) {
        for(const layer of ['back','castle','front','cloud']) assert(await value('dream',`--paper-${layer}-opacity`)>.999);
        const geometry = await dream.evaluate(e=>{
          const papers=[...e.querySelectorAll('[data-paper]')];const bounds=papers.map(n=>n.getBoundingClientRect());
          return { top:Math.min(...bounds.map(r=>r.top)),bottom:Math.max(...bounds.map(r=>r.bottom)),headingBottom:e.querySelector('h2').parentElement.getBoundingClientRect().bottom,z:papers.map(n=>getComputedStyle(n).zIndex),independent:!e.querySelector('[data-book-base] [data-paper]') };
        });
        assert(geometry.independent);
        assert.deepEqual(geometry.z,['1','2','3','4']);
        assert(geometry.top>geometry.headingBottom+4,`${name}: world must clear title: ${JSON.stringify(geometry)}`);
        assert(geometry.bottom<height-70,`${name}: book world must clear controls`);
      }
      if(['desktop','scaled-desktop','tablet','phone'].includes(name) && [0,.49,.68,1].includes(p)) await capture('dream',p);
    }
    await scroll('dream',0);
    for(const layer of ['back','castle','front','cloud']) assert.equal(await value('dream',`--paper-${layer}-opacity`),0);
    const craft = scene('craft');
    assert.equal(await craft.getAttribute('data-pinned'),'true',`${name}: studio needs time for all phases`);
    assert(await craft.evaluate(e=>e.offsetHeight-e.querySelector('[data-stage]').clientHeight<=innerHeight*.81),`${name}: studio sequence must be compact`);
    const phases = [];
    for(const [p,phase] of [[0,'0'],[.2,'0'],[.36,'1'],[.5,'1'],[.72,'2'],[.85,'2'],[1,'2'],[.5,'1'],[0,'0']]) {
      await scroll('craft',p);
      assert.equal(await craft.getAttribute('data-phase'),phase,`${name}: studio step at ${p}`);
      const active = craft.locator('[data-step][data-active=true]');
      assert.equal(await active.count(),1);
      assert.equal(await active.getAttribute('data-step'),phase);
      assert.equal(await active.getAttribute('aria-current'),'step');
      assert.equal(await craft.locator('[data-phase-caption]:not([hidden])').count(),1);
      const images = await craft.locator('img:not([src*=floor])').evaluateAll(es=>Object.fromEntries(es.map(e=>[e.getAttribute('src').split('/').pop(),{visibility:getComputedStyle(e).visibility,opacity:getComputedStyle(e).opacity,clip:getComputedStyle(e).clipPath}])));
      assert.equal(images['studio-sketch.webp'].visibility,'visible');
      for(const image of ['studio-dog.webp','studio-cat.webp']) {
        assert.equal(images[image].visibility,phase==='0'?'hidden':'visible');
        assert.equal(images[image].opacity,phase==='0'?'0':'1');
        assert.equal(images[image].clip,'none');
      }
      assert.equal(images['studio-tools.webp'].visibility,phase==='2'?'visible':'hidden');
      assert.equal(images['studio-tools.webp'].opacity,phase==='2'?'1':'0');
      assert.equal(images['studio-tools.webp'].clip,'none');
      if(phase==='2') {
        const center=await craft.locator('img[src*=studio-dog]').evaluate(e=>{const r=e.getBoundingClientRect();return (r.left+r.width/2)/innerWidth;});
        assert(Math.abs(center-(width<=700?.44:.48))<.015,`${name}: puppy must retain its central anchor`);
      }
      const timeline = await craft.getByRole('list',{name:'Our creative process'}).boundingBox();
      assert(timeline.y>=85 && timeline.y+timeline.height<=height+1);
      assert(Math.abs(await craft.locator('[data-stage]').evaluate(e=>e.getBoundingClientRect().top))<1.5);
      phases.push(phase);
      if(['desktop','scaled-desktop','tablet','phone'].includes(name) && [0,.5,.85].includes(p)) await capture('craft',p);
    }
    await scroll('craft',.5);
    await craft.locator('img').evaluateAll(es=>es.forEach(img=>img.dispatchEvent(new Event('load'))));
    await page.waitForTimeout(300);
    assert.equal(await craft.getAttribute('data-phase'),'1',`${name}: lazy image loads must not skip timeline`);
    assert(await craft.locator('img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>1000)));
    const journal = scene('journal');
    await journal.evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.8,behavior:'instant'}));
    await page.waitForTimeout(430);
    const journalBefore = await value('journal','--journal-card-opacity');
    const imageBefore = await value('journal','--journal-image-y');
    await journal.evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY+innerHeight*.2,behavior:'instant'}));
    await page.waitForTimeout(430);
    assert(await value('journal','--journal-card-opacity')>.99);
    assert(await value('journal','--journal-card-opacity')>journalBefore+.8);
    assert(await value('journal','--journal-image-y')<imageBefore-25);
    if(['desktop','phone'].includes(name)) await capture('journal','visible');
    await journal.evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.8,behavior:'instant'}));
    await page.waitForTimeout(430);
    assert(await value('journal','--journal-card-opacity')<.03);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await journal.getByRole('link',{name:/Read the story/}).focus();
    assert.equal(await journal.evaluate(e=>parseFloat(getComputedStyle(e).getPropertyValue('--journal-card-opacity'))),1);
    const footer=scene('footer');
    await footer.evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight+20,behavior:'instant'}));
    await page.waitForTimeout(430);
    const moonBefore=await value('footer','--footer-moon-y');
    await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
    await page.waitForTimeout(430);
    assert(await value('footer','--footer-opacity')>.999);
    assert(await value('footer','--footer-moon-y')<moonBefore-30);
    assert(await footer.locator('img[src*=footer-moon]').evaluate(e=>e.complete&&e.naturalWidth>2000));
    const drift=footer.locator('[data-moon-drift]');
    assert.equal(await drift.evaluate(e=>getComputedStyle(e).animationPlayState),'running');
    const firstDrift=await drift.evaluate(e=>getComputedStyle(e).transform);
    await page.waitForTimeout(1100);
    assert.notEqual(await drift.evaluate(e=>getComputedStyle(e).transform),firstDrift,`${name}: visible moon must move at the bottom of the page`);
    await footer.getByRole('button',{name:'Pause moon animation'}).click();
    const pausedDrift=await drift.evaluate(async e=>{await Promise.all(e.getAnimations().map(a=>a.ready));return getComputedStyle(e).transform;});
    await page.waitForTimeout(250);
    assert.equal(await drift.evaluate(e=>getComputedStyle(e).transform),pausedDrift);
    await footer.getByRole('button',{name:'Resume moon animation'}).click();
    assert.equal(await drift.evaluate(e=>getComputedStyle(e).animationPlayState),'running');
    if(['desktop','scaled-desktop','phone'].includes(name)) await capture('footer','visible');
    await journal.getByRole('link',{name:/Read the story/}).click();
    await page.waitForURL('**/devlog/the-first-game');
    assert.deepEqual(errors,[]);
    results.push({name,width,height,deviceScaleFactor,status:'passed',studioPhases:phases,checks:['pinned hero','immediate tablet entry','tablet clearance','closed book hold','cover text containment','sequential intact illustrations','whole-silhouette studio reveals','hidden future stages','centered puppy','lazy-load timing','journal entry/reversal','visible moon drift','moon pause/resume','keyboard reveal','story navigation']});
    console.log('PASS',name);await page.close();
  }
  for(const [name,js,reducedMotion] of [['reduced-motion',true,'reduce'],['no-javascript-reduced-motion',false,'reduce'],['no-javascript',false,'no-preference']]) {
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion,javaScriptEnabled:js});
    await page.goto(url);await page.waitForTimeout(250);
    assert.equal(await page.locator('[data-pinned]').count(),0);
    assert.equal(await page.locator('[data-cinematic=dream]').evaluate(e=>getComputedStyle(e).getPropertyValue('--cover-angle').trim()),'0deg');
    assert(await page.locator('[data-paper]').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));
    await page.locator('#journal').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#journal article').first().evaluate(e=>getComputedStyle(e).opacity),'1');
    await page.locator('[data-cinematic=footer]').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('[data-moon-drift]').evaluate(e=>getComputedStyle(e).animationName),'none');
    results.push({name,status:'passed'});await page.close();
  }
  await browser.close();fs.writeFileSync(`${output}/browser-results.json`,JSON.stringify(results,null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
