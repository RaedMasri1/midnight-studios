import { siteIndexable, absoluteUrl } from '../seo';
export const dynamic='force-static';
export function GET(){
 const content=siteIndexable?`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`:'User-agent: *\nDisallow: /\n';
 return new Response(content,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
