'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ChevronRight,X,Star,MessageSquare} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogClose} from '@/components/ui/dialog';
import type {GameRecord} from '@/lib/content';
import type {ReviewRecord} from '@/lib/game-page-schema';
import styles from './game-page.module.css';

export function GameSections({hasScreenshots,reviewsEnabled,reviewCount,galleryLabel='Screenshots'}:{hasScreenshots:boolean;reviewsEnabled:boolean;reviewCount:number;galleryLabel?:string}){
 const [active,setActive]=useState('game-overview');
 const items=[['game-overview','Overview'],...(hasScreenshots?[['game-screenshots',galleryLabel]]:[]),...(reviewsEnabled?[['game-reviews',`Reviews (${reviewCount})`]]:[])];
 useEffect(()=>{
  const elements=items.map(([id])=>document.getElementById(id)).filter((el):el is HTMLElement=>!!el);
  const visible=new Set<Element>();
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);});
   const topmost=elements.find(el=>visible.has(el));if(topmost)setActive(topmost.id);
  },{rootMargin:'-80px 0px -45% 0px',threshold:0});
  elements.forEach(el=>observer.observe(el));return()=>observer.disconnect();
 // Content flags are fixed for each route; no scroll-event state updates.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[hasScreenshots,reviewsEnabled]);
 return <nav className={styles.sectionNav} aria-label="Game sections">{items.map(([id,label])=><a key={id} href={'#'+id} aria-current={active===id?'true':undefined} onClick={()=>setActive(id)}>{label}</a>)}</nav>;
}

export function GameGallery({screenshots}:{screenshots:GameRecord['page']['screenshots']}){
 const galleryTrigger=useRef<HTMLButtonElement|null>(null);
 const track=useRef<HTMLDivElement>(null);const [selected,setSelected]=useState<number|null>(null);
 const [canBack,setCanBack]=useState(false),[canNext,setCanNext]=useState(false);
 useEffect(()=>{
  const el=track.current;if(!el)return;
  const update=()=>{setCanBack(el.scrollLeft>2);setCanNext(el.scrollLeft+el.clientWidth<el.scrollWidth-2)};
  const resize=new ResizeObserver(update);resize.observe(el);el.addEventListener('scroll',update,{passive:true});update();
  return()=>{resize.disconnect();el.removeEventListener('scroll',update)};
 },[screenshots]);
 const scroll=(direction:number)=>{const el=track.current;if(el)el.scrollBy({left:direction*(el.firstElementChild?.getBoundingClientRect().width??el.clientWidth)+direction*18,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});};
 const image=selected===null?null:screenshots[selected];
 return <><div className={styles.gallery}><div className={styles.galleryTrack} ref={track} role="region" aria-label="Game screenshot gallery" tabIndex={0}>{screenshots.map((shot,i)=><figure className={styles.shot+' '+(shot.kind==='concept'?styles.conceptShot:'')} key={shot.src}><button className={styles.shotButton} type="button" aria-label={'Enlarge '+shot.caption} onClick={event=>{galleryTrigger.current=event.currentTarget;setSelected(i)}}><img src={shot.variants?.find(v=>v.width===640)?.src??shot.src} srcSet={shot.variants?[...shot.variants.map(v=>`${v.src} ${v.width}w`),`${shot.src} ${shot.width}w`].join(', '):undefined} sizes={shot.kind==='concept'?'(max-width:760px) calc(100vw - 40px), calc(100vw - 112px)':'(max-width:760px) calc((100vw - 40px) * .72), (max-width:1000px) calc((100vw - 118px) / 4), (min-width:1600px) 332px, calc((100vw - 166px) / 4)'} width={shot.width} height={shot.height} alt={shot.alt} loading="lazy" decoding="async"/></button><figcaption className={styles.caption}>{shot.caption}</figcaption></figure>)}</div><button className={styles.galleryPrev} type="button" onClick={()=>scroll(-1)} disabled={!canBack} aria-label="Previous screenshots"><ChevronRight aria-hidden="true"/></button><button className={styles.galleryNext} type="button" onClick={()=>scroll(1)} disabled={!canNext} aria-label="Next screenshots"><ChevronRight aria-hidden="true"/></button></div>
 <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className={styles.lightbox} onCloseAutoFocus={event=>{event.preventDefault();galleryTrigger.current?.focus()}} showCloseButton={false} aria-describedby={undefined}><div className={styles.lightboxTop}><DialogTitle className={styles.lightboxTitle}>{image?.caption??'Game screenshot'}</DialogTitle><DialogClose asChild><button className={styles.close} aria-label="Close screenshot"><X aria-hidden="true"/> Close</button></DialogClose></div>{image?<img src={image.src} alt={image.alt} width={image.width} height={image.height}/>:null}<div className={styles.lightboxNavigation}><button type="button" onClick={()=>setSelected(i=>Math.max(0,(i??0)-1))} disabled={selected===0}>Previous</button><span>{(selected??0)+1} / {screenshots.length}</span><button type="button" onClick={()=>setSelected(i=>Math.min(screenshots.length-1,(i??0)+1))} disabled={selected===screenshots.length-1}>Next</button></div></DialogContent></Dialog></>;
}

const sourceLabels={'app-store':'App Store','google-play':'Google Play',website:'Website'} as const;
export function GameReviews({records,page}:{records:ReviewRecord[];page:GameRecord['page']}){
 const reviewTrigger=useRef<HTMLButtonElement|null>(null);
 const [rating,setRating]=useState(0),[feedback,setFeedback]=useState(''),[notice,setNotice]=useState(false);
 const [source,setSource]=useState('all'),[limit,setLimit]=useState(5);
 const matching=records.filter(r=>source==='all'||r.source===source);
 const availableSources=[...new Set(records.map(r=>r.source))];
 const average=records.length?(records.reduce((n,r)=>n+r.rating,0)/records.length).toFixed(1):null;
 return <><section className={styles.reviews} id="game-reviews" aria-labelledby="review-heading"><div className={styles.reviewHeading}><h2 className={styles.sectionTitle} id="review-heading">{page.reviewsTitle}</h2><a className={styles.textLink} href="#review-list">Read reviews <ArrowRight aria-hidden="true"/></a></div><div className={styles.reviewsGrid}><div className={styles.reviewList} id="review-list">{records.length?<><p className={styles.reviewSummary}>{average} out of 5 · {records.length} imported and website {records.length===1?'review':'reviews'}</p>{availableSources.length>1?<div className={styles.reviewFilters} aria-label="Review sources"><button type="button" aria-pressed={source==='all'} onClick={()=>{setSource('all');setLimit(5)}}>All reviews</button>{availableSources.map(s=><button key={s} type="button" aria-pressed={source===s} onClick={()=>{setSource(s);setLimit(5)}}>{sourceLabels[s]}</button>)}</div>:null}{matching.slice(0,limit).map(review=><article className={styles.reviewCard} key={review.source+review.id}><div className={styles.reviewMeta}><strong>{review.author}</strong><span>{sourceLabels[review.source]}</span><time dateTime={review.publishedAt}>{new Intl.DateTimeFormat('en',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(review.publishedAt))}</time></div><div className={styles.reviewStars} aria-label={review.rating+' out of 5 stars'}>{[1,2,3,4,5].map(n=><Star key={n} data-filled={n<=review.rating} aria-hidden="true"/>)}</div>{review.title?<h3>{review.title}</h3>:null}<p>{review.body}</p></article>)}{matching.length>limit?<button className={styles.showMore} onClick={()=>setLimit(n=>n+5)}>More reviews</button>:null}</>:<div className={styles.reviewEmpty}><MessageSquare aria-hidden="true"/><div><h3>{page.reviewsEmptyTitle}</h3><p>{page.reviewsEmptyText}</p></div></div>}</div><form className={styles.composer} onSubmit={event=>{event.preventDefault();if(page.signInUrl)window.location.assign(page.signInUrl);else setNotice(true)}}><label htmlFor="review-feedback">{page.feedbackLabel}</label><fieldset className={styles.ratingField}><legend className={styles.ratingLegend}>Your rating</legend><div className={styles.stars}>{[1,2,3,4,5].map(n=><label className={styles.starOption} key={n} data-filled={n<=rating}><input type="radio" name="rating" value={n} checked={rating===n} onChange={()=>setRating(n)} aria-label={n+' '+(n===1?'star':'stars')}/><Star aria-hidden="true"/></label>)}</div></fieldset><textarea id="review-feedback" name="feedback" placeholder={page.feedbackPlaceholder} aria-label={page.feedbackLabel} value={feedback} onChange={event=>setFeedback(event.target.value)} maxLength={3000}/><button ref={reviewTrigger} className={styles.submit} type="submit">Sign in to submit</button><p className={styles.reviewPolicy}>{page.reviewPolicy}</p></form></div></section><Dialog open={notice} onOpenChange={setNotice}><DialogContent className={styles.reviewNotice} onCloseAutoFocus={event=>{event.preventDefault();reviewTrigger.current?.focus()}} showCloseButton={false} aria-describedby="review-unavailable-description"><DialogTitle>{page.reviewUnavailableTitle}</DialogTitle><p id="review-unavailable-description">{page.reviewUnavailableText}</p><DialogClose asChild><button className={styles.submit}>Got it</button></DialogClose></DialogContent></Dialog></>;
}
