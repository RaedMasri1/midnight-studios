// Server/CLI-only. Tokens are never embedded in game records or browser code.
export function normalizeAppleReviews(data,gameSlug){
 return (data.data??[]).map(review=>({
  id:String(review.id),gameSlug,source:'app-store',author:review.attributes.reviewerNickname||'App Store player',
  rating:review.attributes.rating,title:review.attributes.title||'',body:review.attributes.body,
  publishedAt:new Date(review.attributes.createdDate).toISOString()
 }));
}
export function normalizeGoogleReviews(data,gameSlug){
 return (data.reviews??[]).flatMap(review=>{
  const comment=review.comments?.find(c=>c.userComment)?.userComment;
  if(!comment?.text?.trim())return [];
  const split=comment.text.indexOf('\t');
  return [{id:String(review.reviewId),gameSlug,source:'google-play',author:review.authorName||'Google Play player',
   rating:comment.starRating,title:split<0?'':comment.text.slice(0,split),body:split<0?comment.text:(comment.text.slice(split+1).trim()||comment.text.slice(0,split)),
   publishedAt:new Date(Number(comment.lastModified.seconds)*1000).toISOString(),
   ...(comment.reviewerLanguage?{language:comment.reviewerLanguage}:{})
  }];
 });
}
export function mergeReviews(existing,incoming,{gameSlug,source,replace=false}){
 const retained=replace?existing.filter(r=>r.gameSlug!==gameSlug||r.source!==source):existing;
 const records=new Map(retained.map(r=>[[r.gameSlug,r.source,r.id].join(':'),r]));
 incoming.forEach(r=>records.set([r.gameSlug,r.source,r.id].join(':'),r));
 return [...records.values()];
}
async function request(url,token,fetcher){
 const response=await fetcher(url,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`Store request failed (${response.status}); cached reviews were not changed.`);
 return response.json();
}
export async function fetchAppleReviews(appId,token,gameSlug,fetcher=fetch){
 if(!/^\d+$/.test(appId))throw new Error('Invalid Apple app ID');
 let url=`https://api.appstoreconnect.apple.com/v1/apps/${appId}/customerReviews?limit=200`;
 const reviews=[],seen=new Set();
 for(let page=0;url&&page<100;page++){
  const next=new URL(url);
  if(next.protocol!=='https:'||next.hostname!=='api.appstoreconnect.apple.com'||next.username||next.password||next.pathname!==`/v1/apps/${appId}/customerReviews`)throw new Error('Unexpected Apple pagination URL');
  if(seen.has(url))throw new Error('Repeated Apple pagination URL');seen.add(url);
  const data=await request(url,token,fetcher);reviews.push(...normalizeAppleReviews(data,gameSlug));
  url=data.links?.next||'';
 }
 if(url)throw new Error('Apple pagination exceeded the import limit; cache unchanged');
 return reviews;
}
export async function fetchGoogleReviews(packageName,token,gameSlug,fetcher=fetch){
 if(!/^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(packageName))throw new Error('Invalid Google Play package name');
 const reviews=[],seen=new Set();let pageToken='';
 for(let page=0;page<100;page++){
  const url=new URL(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/reviews`);
  url.searchParams.set('maxResults','100');if(pageToken)url.searchParams.set('token',pageToken);
  const data=await request(url.href,token,fetcher);reviews.push(...normalizeGoogleReviews(data,gameSlug));
  pageToken=data.tokenPagination?.nextPageToken||'';
  if(!pageToken)return reviews;
  if(seen.has(pageToken))throw new Error('Repeated Google pagination token');seen.add(pageToken);
 }
 throw new Error('Google pagination exceeded the import limit; cache unchanged');
}
