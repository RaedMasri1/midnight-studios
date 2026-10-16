'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {chapterFrame,chapterProgress,clamp} from '@/lib/scroll-motion';
import {Dialog,DialogClose,DialogContent,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
/** Passive native scrolling; one read/write batch for visible chapters, never a ticker. */
export function SiteEffects(){const pathname=usePathname();useEffect(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const native=CSS.supports('animation-timeline: view()')&&CSS.supports('animation-range: entry 0% cover 100%');
 const header=document.querySelector<HTMLElement>('.site-header');
 const chapters=[...document.querySelectorAll<HTMLElement>('[data-chapter]')];
 const scenes=[...document.querySelectorAll<HTMLElement>('[data-motion]')].filter(el=>!el.closest('[data-chapter]'));
 const reveals=[...document.querySelectorAll<HTMLElement>('.section-head,.game-feature,.journal-copy,.about-copy,.about-values article,.contact-follow,.article-body>h2,.article-body>p')].filter(el=>!el.closest('[data-chapter]'));
 const active=new Set<HTMLElement>();const touched=new Set<HTMLElement>();const animations=new Set<Animation>();const revealed=new Set<HTMLElement>();
 let frame=0,observer:IntersectionObserver|undefined,revealObserver:IntersectionObserver|undefined;
 let enabled=false;let inset=104;
 function render(){frame=0;
  // All geometry is read before any style mutation.
  const measurements=enabled?[...active].map(el=>({el,box:el.getBoundingClientRect(),stageHeight:el.dataset.chapter?el.querySelector<HTMLElement>('.chapter-pin')?.clientHeight:undefined})):[];
  const scroll=window.scrollY, viewport=innerHeight;
  header?.classList.toggle('is-scrolled',scroll>24);
  for(const {el,box,stageHeight} of measurements){
   if(el.dataset.chapter){const values=chapterFrame(chapterProgress(box.top,box.height,stageHeight!==undefined?stageHeight+inset:viewport,inset));
    el.style.setProperty('--fan-spread',values.spread.toFixed(4));
    el.style.setProperty('--side-opacity',values.sideOpacity.toFixed(4));
    el.style.setProperty('--center-scale',values.centerScale.toFixed(4));
    el.style.setProperty('--screen-lift',values.screenLift.toFixed(2)+'px');
    el.style.setProperty('--chapter-lift',values.textLift.toFixed(2)+'px');
    el.style.setProperty('--logo-scale',values.logoScale.toFixed(4));
    el.style.setProperty('--journal-scale',values.journalScale.toFixed(4));
    el.style.setProperty('--word-two-lift',values.secondWordLift.toFixed(2)+'%');
    el.style.setProperty('--word-three-lift',values.thirdWordLift.toFixed(2)+'%');
    el.style.setProperty('--chapter-progress',values.progress.toFixed(4));touched.add(el);
   }else if(!native){const progress=clamp((viewport-box.top)/(viewport+box.height));const img=el.querySelector<HTMLElement>('img');
    if(img&&el.dataset.motion==='artwork'){img.style.setProperty('--art-shift',`${(2-4*progress).toFixed(2)}%`);img.style.setProperty('--art-scale',(1.06-.035*Math.sin(progress*Math.PI)).toFixed(4));touched.add(img);}
    else if(el.dataset.motion==='statement'){el.style.setProperty('--type-shift',`${(18*(1-clamp(progress/.45))).toFixed(1)}px`);touched.add(el);}
   }
  }
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
 function clear(){observer?.disconnect();revealObserver?.disconnect();active.clear();animations.forEach(a=>a.cancel());animations.clear();
  for(const el of touched)for(const prop of ['--art-shift','--art-scale','--type-shift','--fan-spread','--side-opacity','--center-scale','--screen-lift','--chapter-lift','--logo-scale','--journal-scale','--chapter-progress','--word-two-lift','--word-three-lift'])el.style.removeProperty(prop);
  touched.clear();chapters.forEach(el=>el.classList.remove('is-motion-enabled','chapter-has-focus'));
 }
 function reset(){clear();inset=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'))||104;
  // Short windows and enlarged text use the comfortable, unpinned reading layout.
  enabled=!reduced.matches&&innerHeight>=620&&parseFloat(getComputedStyle(document.documentElement).fontSize)<24;
  if(enabled){chapters.forEach(el=>el.classList.add('is-motion-enabled'));
   // Editable content can be longer than today's copy. Never pin a chapter that cannot fit.
   const overflow=chapters.filter(el=>{const pin=el.querySelector<HTMLElement>('.chapter-pin');return pin&&pin.scrollHeight>pin.clientHeight+2;});
   overflow.forEach(el=>el.classList.remove('is-motion-enabled'));
   observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)active.add(e.target as HTMLElement);else active.delete(e.target as HTMLElement);}schedule();},{rootMargin:'15% 0px',threshold:0});
   chapters.filter(el=>el.classList.contains('is-motion-enabled')).forEach(el=>observer!.observe(el));if(!native)scenes.forEach(el=>observer!.observe(el));
   revealObserver=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;const el=e.target as HTMLElement;revealObserver!.unobserve(el);revealed.add(el);
    if(typeof el.animate==='function'){const sibling=el.matches('.game-feature')?[...el.parentElement!.children].indexOf(el)%2:0;
     const animation=el.animate([{opacity:.65,transform:'translateY(38px)'},{opacity:1,transform:'translateY(0)'}],{duration:900,delay:sibling*90,easing:'cubic-bezier(.16,1,.3,1)'});animations.add(animation);animation.onfinish=()=>animations.delete(animation);}
   }},{threshold:.12});reveals.filter(el=>!revealed.has(el)).forEach(el=>revealObserver!.observe(el));
  }schedule();
 }
 function resize(){reset();}
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();}
 function focus(event:FocusEvent){const target=event.target;if(!(target instanceof Element))return;
  // Focusing any control never leaves it between off-screen animation states.
  const el=target.closest<HTMLElement>('[data-chapter]');if(el)el.classList.add('chapter-has-focus');
  animations.forEach(a=>{const effect=a.effect as KeyframeEffect|null;if(effect?.target instanceof Element&&effect.target.contains(target))a.finish();});
 }
 function blur(event:FocusEvent){const target=event.target;if(target instanceof Element){const el=target.closest<HTMLElement>('[data-chapter]');if(el&&!el.contains(event.relatedTarget as Node|null))el.classList.remove('chapter-has-focus');}}
 reset();const main=document.getElementById('main');if(enabled&&main?.animate){const a=main.animate([{opacity:.8},{opacity:1}],{duration:420});animations.add(a);a.onfinish=()=>animations.delete(a);}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',visibility);document.addEventListener('focusin',focus);document.addEventListener('focusout',blur);reduced.addEventListener('change',reset);
 return()=>{clear();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('focusin',focus);document.removeEventListener('focusout',blur);reduced.removeEventListener('change',reset);};
 },[pathname]);return null;}
export function Menu({active}:{active:string}){const pathname=usePathname();return <MenuDialog key={pathname} active={active}/>;}
function MenuDialog({active}:{active:string}){const [open,setOpen]=useState(false);useEffect(()=>{const query=matchMedia('(min-width: 1024px)');const close=()=>{if(query.matches)setOpen(false);};query.addEventListener('change',close);return()=>query.removeEventListener('change',close);},[]);return <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger asChild><button className="menu-button" aria-label="Open studio menu"><span>Menu</span><span className="menu-glyph" aria-hidden="true"><i/><i/></span></button></DialogTrigger>
 <DialogContent fullScreen className="studio-menu" showCloseButton={false} aria-describedby={undefined}><DialogTitle className="sr-only">Explore Midnight Studios</DialogTitle><div className="menu-masthead"><DialogClose asChild><Link prefetch={false} href="/" className="menu-brand" translate="no"><img src="/assets/logo.svg" alt="" width="24" height="31"/>Midnight Studios</Link></DialogClose><DialogClose asChild><button className="menu-close" aria-label="Close studio menu">Close <span aria-hidden="true">×</span></button></DialogClose></div><nav className="menu-links" aria-label="Studio menu">{[['Home','/','home'],['Games','/games','games'],['Journal','/devlog','devlog'],['About','/about','about'],['Contact','/contact','contact']].map(([label,url,id],i)=><DialogClose asChild key={id}><Link prefetch={false} href={url} aria-current={active===id?'page':undefined} style={{'--menu-delay':`${80+i*45}ms`} as CSSProperties}><span>{label}</span></Link></DialogClose>)}</nav><div className="menu-foot"><span>Doha, Qatar</span><a href="mailto:founder@midnightstudios.app">founder@midnightstudios.app</a></div></DialogContent></Dialog>}
