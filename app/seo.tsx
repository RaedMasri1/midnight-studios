import type { Metadata } from 'next';
import {getPublishedGames,getPublishedPosts} from '@/lib/content';

// Production values are in .env.production; local development stays noindex.
export const siteOrigin = (process.env.SITE_URL || 'https://www.midnightstudios.app').replace(/\/$/, '');
const previewDeployment = process.env.VERCEL_ENV === 'preview' || ['deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT ?? '');
export const siteIndexable = process.env.SITE_INDEXABLE === 'true' && !previewDeployment;
export const absoluteUrl = (path:string) => new URL(path, siteOrigin).href;
export const organizationId = absoluteUrl('/#studio');
export const indexablePaths = ['/', '/games', '/about', '/devlog', '/contact', ...getPublishedGames().map(game=>'/games/'+game.slug), ...getPublishedPosts().map(post=>'/devlog/'+post.slug)];
export const studioDescription = 'Midnight Studios is an independent game development studio in Doha, Qatar, creating mobile games. Explore our games, worlds, and development stories.';
export const socialImage = '/assets/midnight-studios-social-050.jpg';

export function pageMetadata({title,description,path,type='website',image:source=socialImage,imageAlt='Midnight Studios — Imagination never sleeps; an orange puppy jumping inside a luminous forest portal',imageWidth,imageHeight}:{title:string,description:string,path:string,type?:'website'|'article',image?:string,imageAlt?:string,imageWidth?:number,imageHeight?:number}):Metadata{
 const image = {url:absoluteUrl(source),alt:imageAlt,...(source===socialImage?{width:1200,height:630,type:'image/jpeg'}:imageWidth&&imageHeight?{width:imageWidth,height:imageHeight}:{})};
 return {title,description,alternates:{canonical:absoluteUrl(path)},openGraph:{title,description,url:absoluteUrl(path),siteName:'Midnight Studios',type,locale:'en_US',images:[image]},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export function StructuredData({data}:{data:Record<string,unknown>|Record<string,unknown>[]}){
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}
export function BreadcrumbData({items}:{items:[string,string][]}){
 return <StructuredData data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map(([name,path],i)=>({'@type':'ListItem',position:i+1,name,item:absoluteUrl(path)}))}}/>;
}
export function StudioData(){return <StructuredData data={[
 {'@context':'https://schema.org','@type':'Organization','@id':organizationId,name:'Midnight Studios',url:siteOrigin,logo:{'@type':'ImageObject',url:absoluteUrl('/assets/logo.svg'),width:490,height:622},image:absoluteUrl(socialImage),description:studioDescription,email:'founder@midnightstudios.app',address:{'@type':'PostalAddress',addressLocality:'Doha',addressCountry:'QA'}},
 {'@context':'https://schema.org','@type':'WebSite','@id':absoluteUrl('/#website'),name:'Midnight Studios',url:siteOrigin,inLanguage:'en',publisher:{'@id':organizationId}}
]}/>}
