import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const root=process.cwd();
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(path.join(root,'out/_next'));
const js=files.filter(f=>f.endsWith('.js')),css=files.filter(f=>f.endsWith('.css'));
const bytes=f=>fs.statSync(f).size,gzip=f=>zlib.gzipSync(fs.readFileSync(f),{level:9}).length;
const sum=(items,measure)=>items.reduce((s,f)=>s+measure(f),0),kb=n=>(n/1024).toFixed(1)+' KiB';
const html=fs.readFileSync('out/index.html','utf8');
const entries=[...html.matchAll(/<script\b([^>]*)src="([^"]+)"([^>]*)>/g)].map(m=>({file:path.join(root,'out',m[2]),legacy:/nomodule|noModule/i.test(m[1]+m[3])}));
const modern=entries.filter(e=>!e.legacy).map(e=>e.file);
const jsGzip=sum(js,gzip),cssGzip=sum(css,gzip),entryGzip=sum(entries.map(e=>e.file),gzip),modernGzip=sum(modern,gzip);
if(entryGzip>220*1024)throw new Error('Home entry scripts exceed 220 KiB gzip');
const publicHtml=walk(path.join(root,'out')).filter(f=>f.endsWith('.html')&&!f.endsWith('/admin.html'));
const scriptFiles=source=>[...source.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>path.join(root,'out',decodeURIComponent(m[1])));
const publicScripts=[...new Set(publicHtml.flatMap(f=>scriptFiles(fs.readFileSync(f,'utf8'))))];
const publicGzip=sum(publicScripts,gzip);
const adminScripts=scriptFiles(fs.readFileSync('out/admin.html','utf8'));
const adminOnly=adminScripts.filter(f=>!publicScripts.includes(f));
const adminOnlyGzip=sum(adminOnly,gzip);
if(publicGzip>320*1024)throw new Error('Public website route scripts exceed 320 KiB gzip');
if(adminOnlyGzip>150*1024)throw new Error('Admin-only entry scripts exceed 150 KiB gzip');
if(publicScripts.some(f=>fs.readFileSync(f,'utf8').includes('sb_publishable_')))throw new Error('Supabase admin client was bundled into public website entries');
const assets=['logo.svg','manrope-latin.woff2','portal-cave.webp','portal-cave-960.webp','portal-cave-mobile.webp','portal-cave-mobile-480.webp','portal-cave-mobile-700.webp','hero-puppy.webp','dream-cutouts.webp','studio-dog.webp','studio-cat.webp','studio-sketch.webp','studio-tools.webp','studio-floor.webp','just-jump-ascent.webp','just-jump-forest-640.webp','just-jump-crystal-caves-640.webp','heel-shoe.webp','heel-district.webp','heel-district-desktop.webp','trivia-icons.webp','tadri-players.webp','idle-chaos-storm.webp'];
assets.push('midnight-studios-social-050.jpg');
assets.push('portal-cave-tablet.webp','portal-cave-tablet-800.webp');
assets.push('just-jump-tablet-forest.webp','just-jump-tablet-forest-480.webp','just-jump-tablet-forest-768.webp','just-jump-tablet-caves.webp','just-jump-tablet-caves-480.webp','just-jump-tablet-caves-768.webp');
const sequence=path.join(root,'public/assets/idle-chaos-frames');
const desktopFrames=fs.readdirSync(sequence).filter(f=>f.endsWith('.webp')).map(f=>path.join(sequence,f));
const mobileFrames=fs.readdirSync(path.join(sequence,'mobile')).filter(f=>f.endsWith('.webp')).map(f=>path.join(sequence,'mobile',f));
const rows=[...assets.map(name=>[name,kb(bytes(path.join(root,'public/assets',name))),'Stored asset size']),['Idle Chaos desktop sequence',kb(sum(desktopFrames,bytes)),desktopFrames.length+' frames, fetched near the chapter'],['Idle Chaos mobile sequence',kb(sum(mobileFrames,bytes)),mobileFrames.length+' alternative smaller frames'],['Home entry scripts, including legacy polyfill',kb(entryGzip),'Scripts referenced in home HTML'],['Home modern entry scripts',kb(modernGzip),'Excludes nomodule polyfill'],['Public route scripts combined',kb(publicGzip),'Unique scripts referenced by public HTML; excludes admin'],['Admin-only entry scripts',kb(adminOnlyGzip),'Only loaded at /admin'],['All generated JavaScript',kb(jsGzip),js.length+' files across all routes'],['All generated CSS',kb(cssGzip),css.length+' files']];
fs.writeFileSync('docs/delivery-audit.md',`# Cinematic homepage delivery audit

| Asset or code scope | Size | Method |
| --- | --- | --- |
${rows.map(r=>'| '+r.join(' | ')+' |').join('\n')}

These are gzip estimates and stored asset bytes, not load times, measured FPS or field Core Web Vitals. Home scripts exclude HTML/RSC payloads, images and fonts. All-route JavaScript is not the initial download.

## Verification

The current build passes the production build and TypeScript, exported routes/metadata/internal links, bounded reversible scroll poses, closed-book cutout checks, content/media schemas, journal visibility/deduplication/0–100article selections, mocked store-import adapters and three new world checks. The latter cover fracture timing, projected full-scroll trivia/player clearance across nine art widths, bounded decoded-frame eviction, all 192 sequence files and static fallback markup.

No browser or preview runner was available in the current managed environment. New chapter layout, scroll playback and browser/device performance have not been visually verified in a browser. Earlier supplied browser captures and reports describe the previous revision only. The included Idle Chaos MP4 verifies the rendered source sequence, not the website. No Lighthouse/FPS or physical-device claim is made. See responsive-refinements.md for the current changes and verification scope; journal-refresh.md, feedback-refinements.md and three-new-worlds.md describe earlier updates.

About uses five separate generated assets: a mesh puppy, gray cat, sketch sheet, paper with pencil, and floor. The original reference screenshot is no longer rendered. Dreamward uses a new illustrated atlas with whole cutouts; the Games collection and Journal use corrected vertical-ascent concept art. Portal, studio, journal and Dreamward illustrations are concept assets. Original supplied game screenshots and original logo are retained.

No animation runtime dependency or scroll hijacking was added. Visible chapters update CSS transforms through a passive scroll listener and an on-demand requestAnimationFrame loop. Four isolated Tadri cards also resize their width and height during the final morph to preserve corner radii and text proportions. Idle Chaos seeks a canvas sequence, with three concurrent fetches and at most twelve retained decoded frames. That cap represents approximately 40.3 MiB desktop or 14.5 MiB mobile of RGBA pixel data, excluding browser overhead, canvas storage and other images; it is an estimate, not a browser memory measurement. The full sequence is not decoded at once. Offscreen caches are released, reduced motion uses the poster, and the mobile sequence is selected at widths up to 700px. The lunar surface retains its existing pause/resume control. Short windows, large type and overflowing stages use a normal reading layout.

Budgets: 220 KiB home entry scripts and 320 KiB combined public-route entry JavaScript and 150 KiB admin-only entry JavaScript. Production builds use the public indexing settings in .env.production. Development stays noindex, and private preview builds can set SITE_INDEXABLE=false.
`);
console.log(JSON.stringify({allJsGzipBytes:jsGzip,cssGzipBytes:cssGzip,homeEntryGzipBytes:entryGzip,homeModernEntryGzipBytes:modernGzip,publicRouteGzipBytes:publicGzip,adminOnlyEntryGzipBytes:adminOnlyGzip}));
