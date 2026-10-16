import { indexablePaths, absoluteUrl, siteIndexable } from '../seo';
export const dynamic='force-static';
export function GET(){
 const urls=(siteIndexable?indexablePaths:[]).map(path=>`<url><loc>${absoluteUrl(path)}</loc></url>`).join('');
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
