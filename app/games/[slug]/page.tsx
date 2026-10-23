import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowRight,UsersRound,ChartNoAxesColumnIncreasing,Smartphone} from 'lucide-react';
import {getPublishedGames,getGame} from '@/lib/content';
import {getGameReviews} from '@/lib/reviews';
import {pageMetadata,BreadcrumbData,StructuredData,absoluteUrl,organizationId} from '../../seo';
import {Menu,SiteEffects} from '../../ui';
import {FooterSupport} from '../../footer-support';
import {GameGallery,GameSections,GameReviews} from './game-client';
import styles from './game-page.module.css';
export const dynamicParams=false;
export function generateStaticParams(){return getPublishedGames().map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const game=getGame(slug);if(!game)notFound();
 const screenshot=game.page.screenshots[0];
 return pageMetadata({title:game.name+' | Mobile Game by Midnight Studios',description:game.seoDescription,path:'/games/'+slug,image:screenshot?.src??game.image,imageAlt:screenshot?.alt??game.imageAlt,imageWidth:screenshot?.width,imageHeight:screenshot?.height});
}
function Wordmark(){return <span className={styles.brandLockup}><img src="/assets/logo.svg" alt="" width="28" height="36"/><span translate="no">Midnight<br/>Studios</span></span>}
export default async function Game({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const game=getGame(slug);if(!game)notFound();
 const page=game.page,reviews=page.reviewsEnabled?getGameReviews(slug):[];
 const showReviews=page.reviewsEnabled&&(reviews.length>0||Boolean(page.signInUrl));
 const conceptGallery=page.screenshots.length>0&&page.screenshots.every(image=>image.kind==='concept');
 const stores=game.status==='Released'?Object.entries(game.stores).filter(([,store])=>store.released&&store.url):[];
 const icons={characters:UsersRound,progression:ChartNoAxesColumnIncreasing,platforms:Smartphone};
 const icon=page.icon;
 const iconStyle=icon?.crop?{width:`${icon.width/icon.crop.width*100}%`,height:'auto',left:`${-icon.crop.x/icon.crop.width*100}%`,top:`${-icon.crop.y/icon.crop.height*100}%`}:undefined;
 return <div className={styles.page}><SiteEffects/><a className="skip-link" href="#main">Skip to content</a><div className={styles.shell}><header className={styles.header}><Link prefetch={false} href="/" className={styles.brand} aria-label="Midnight Studios homepage"><Wordmark/></Link><nav className={styles.navigation} aria-label="Main navigation">{[['Games','/games'],['Journal','/devlog'],['About','/about'],['Contact','/contact']].map(([name,url])=><Link prefetch={false} key={url} href={url} aria-current={url==='/games'?'page':undefined}>{name}</Link>)}</nav><div className={styles.mobileMenu}><Menu active="games"/></div></header><main id="main"><BreadcrumbData items={[["Home","/"],["Games","/games"],[game.name,'/games/'+slug]]}/><StructuredData data={{'@context':'https://schema.org','@type':'VideoGame',name:game.name,url:absoluteUrl('/games/'+slug),description:game.description,genre:game.schemaGenre,image:page.screenshots.map(s=>absoluteUrl(s.src)),publisher:{'@id':organizationId},gamePlatform:game.platforms,inLanguage:'en',creator:{'@type':'Organization',name:page.developer,'@id':organizationId},creativeWorkStatus:game.status,...(stores.length?{sameAs:stores.map(([,store])=>store.url)}:{})}}/>
 <div className={styles.breadcrumb} aria-label="Breadcrumb"><Link prefetch={false} href="/games">Games</Link><span aria-hidden="true">/</span><span translate="no">{game.name}</span></div>
 <section className={styles.hero} aria-labelledby="game-title">{icon?<div className={styles.icon}><img src={icon.src} alt={icon.alt} width={icon.width} height={icon.height} style={iconStyle} fetchPriority="high"/></div>:<div className={styles.icon+' '+styles.iconFallback} aria-label="Game icon not yet announced">{game.name.slice(0,1)}</div>}<div className={styles.heroCopy}><div className={styles.heroTitle}><h1 id="game-title" translate="no">{game.name}</h1><p className={styles.developer}>by {page.developer}</p><span className={styles.status}>{game.status==='Released'?page.availableStatusLabel:page.statusLabel}</span></div><div className={styles.heroDetails}><p className={styles.pitch}>{page.pitch}</p><div className={styles.heroLinks}>{page.screenshots.length?<a href="#game-screenshots" className={styles.textLink}>{conceptGallery?'View artwork':'View screenshots'} <ArrowRight aria-hidden="true"/></a>:null}{showReviews?<a href="#game-reviews" className={styles.textLink}>Read reviews <ArrowRight aria-hidden="true"/></a>:null}</div>{stores.length?<div className={styles.storeLinks} aria-label="Download the game">{stores.map(([key,store])=><a className={styles.storeButton} key={key} href={store.url!} target="_blank" rel="noopener noreferrer"><Smartphone aria-hidden="true"/><span><small>{key==='appStore'?'Download on the':'Get it on'}</small>{key==='appStore'?'App Store':'Google Play'}</span></a>)}</div>:null}</div></div></section>
 <GameSections hasScreenshots={page.screenshots.length>0} reviewsEnabled={showReviews} reviewCount={reviews.length} galleryLabel={conceptGallery?'Artwork':'Screenshots'}/>
 <section className={styles.gallerySection} id="game-screenshots" aria-labelledby="gallery-title"><h2 id="gallery-title" className={styles.sectionTitle}>{page.galleryTitle}</h2><p className={styles.sectionIntro}>{page.galleryIntro}</p>{page.screenshots.length?<GameGallery screenshots={page.screenshots}/>:<p className={styles.emptyGallery}>{page.galleryEmptyText}</p>}</section>
 <section className={styles.overview} id="game-overview" aria-labelledby="overview-title"><div className={styles.overviewTop}><h2 id="overview-title">{page.overviewTitle}</h2><div className={styles.overviewCopy}>{page.overviewParagraphs.map((text,i)=><p key={i}>{text}</p>)}</div></div><div className={styles.highlights}>{page.highlights.map((highlight,i)=>{const Icon=icons[highlight.icon??'characters'];return <div className={styles.highlight} key={i}><Icon aria-hidden="true"/><div><h3>{highlight.title}</h3><p>{highlight.text}</p></div></div>})}</div></section>
 {showReviews?<GameReviews records={reviews} page={page}/>:null}</main><footer className={styles.footer}><FooterSupport className={styles.footerSupport}/><div className={styles.footerLeft}><Link prefetch={false} href="/" className={styles.brand} aria-label="Midnight Studios homepage"><Wordmark/></Link><span className={styles.footerCopy}>{page.footerText}</span></div><span>© {new Date().getFullYear()} Midnight Studios</span></footer></div></div>;
}
