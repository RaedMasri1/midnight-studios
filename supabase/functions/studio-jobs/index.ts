import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {fetchAppleReviews,fetchGoogleReviews,mergeReviews} from '../_shared/store-review-import.js';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-studio-job-secret','Access-Control-Allow-Methods':'POST, OPTIONS'};
function reply(status:number,body:unknown){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});}
const env=(key:string)=>Deno.env.get(key)??'';
const bytes=(text:string)=>new TextEncoder().encode(text);
function base64url(data:Uint8Array){return btoa(String.fromCharCode(...data)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
function pem(value:string){const raw=value.replace(/\\n/g,'\n').replace(/-----[^-]+-----/g,'').replace(/\s/g,'');return Uint8Array.from(atob(raw),c=>c.charCodeAt(0));}
async function jwt(header:object,payload:object,key:CryptoKey,algorithm:AlgorithmIdentifier|EcdsaParams){const input=base64url(bytes(JSON.stringify(header)))+'.'+base64url(bytes(JSON.stringify(payload)));return input+'.'+base64url(new Uint8Array(await crypto.subtle.sign(algorithm,key,bytes(input))));}
async function appleToken(){
 if(!env('APPLE_PRIVATE_KEY')||!env('APPLE_KEY_ID')||!env('APPLE_ISSUER_ID'))throw new Error('Add Apple API credentials to server secrets before syncing a released App Store game.');
 const key=await crypto.subtle.importKey('pkcs8',pem(env('APPLE_PRIVATE_KEY')),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);const now=Math.floor(Date.now()/1000);
 return jwt({alg:'ES256',kid:env('APPLE_KEY_ID'),typ:'JWT'},{iss:env('APPLE_ISSUER_ID'),iat:now,exp:now+600,aud:'appstoreconnect-v1'},key,{name:'ECDSA',hash:'SHA-256'});
}
async function googleToken(){
 if(!env('GOOGLE_SERVICE_ACCOUNT_JSON'))throw new Error('Add the authorized Google service account to server secrets before syncing a released Play Store game.');
 const account=JSON.parse(env('GOOGLE_SERVICE_ACCOUNT_JSON'));const now=Math.floor(Date.now()/1000);
 const key=await crypto.subtle.importKey('pkcs8',pem(account.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const assertion=await jwt({alg:'RS256',typ:'JWT'},{iss:account.client_email,scope:'https://www.googleapis.com/auth/androidpublisher',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600},key,'RSASSA-PKCS1-v1_5');
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Google authorization failed. Check the service account and Play Console permissions.');return (await response.json()).access_token;
}
async function deploy(){
 const hook=env('DEPLOY_HOOK_URL');if(!hook)return 'Publication saved. Hosting is not connected yet. Run npm run cms:pull and npm run build locally, or configure DEPLOY_HOOK_URL to enable online publishing.';
 const url=new URL(hook);if(url.protocol!=='https:'||!['api.cloudflare.com','api.netlify.com'].includes(url.hostname)||url.username||url.password)throw new Error('Configure an official Cloudflare or Netlify HTTPS deploy hook in server secrets.');
 const response=await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('Content is saved, but hosting rejected the build request. Retry the hosting build from Settings.');
 return 'Build requested. Changes appear on the website after the hosting build succeeds.';
}
Deno.serve(async(request:Request)=>{
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});if(request.method!=='POST')return reply(405,{error:'POST required'});
 try{
  const service=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  const scheduled=Boolean(env('STUDIO_JOB_SECRET'))&&request.headers.get('x-studio-job-secret')===env('STUDIO_JOB_SECRET');
  if(!scheduled){const token=request.headers.get('authorization')?.replace(/^Bearer /i,'');if(!token)return reply(401,{error:'Sign in as a studio admin.'});const {data,error}=await service.auth.getUser(token);if(error||!data.user)return reply(401,{error:'Session expired. Sign in again.'});const membership=await service.from('cms_admins').select('user_id').eq('user_id',data.user.id).maybeSingle();if(membership.error||!membership.data)return reply(403,{error:'Admin access required.'});}
  const body=await request.json();if(body.action==='deploy'&&!scheduled)return reply(200,{message:await deploy()});if(body.action!=='reviews')return reply(400,{error:'Unknown job'});
  const lease=await service.rpc('cms_acquire_review_lease');if(lease.error||!lease.data)return reply(409,{error:'A review sync is already running. Try again later.'});
  try{
   const [published,cache]=await Promise.all([service.from('cms_publication').select('snapshot').eq('id',true).single(),service.from('cms_store_cache').select('reviews').eq('id',true).single()]);if(published.error||cache.error)throw new Error('Initialize studio content first.');
   let reviews=cache.data.reviews;let stores=0,imported=0;let apple='',google='';
   for(const game of published.data.snapshot.games){
    if(game.status!=='Released')continue;
    for(const [name,store] of Object.entries(game.stores) as [string,{released:boolean;appId?:string;packageName?:string}][]){
     if(!store.released)continue;const isApple=name==='appStore';const id=isApple?store.appId:store.packageName;if(!id)throw new Error('Missing official store ID for '+game.slug);
     const token=isApple?(apple||=await appleToken()):(google||=await googleToken());const incoming=await(isApple?fetchAppleReviews(id,token,game.slug):fetchGoogleReviews(id,token,game.slug));
     if(incoming.some((r:{rating:number;body:string;publishedAt:string})=>!Number.isInteger(r.rating)||r.rating<1||r.rating>5||!r.body?.trim()||r.body.length>10000||!Number.isFinite(Date.parse(r.publishedAt))))throw new Error('Store returned invalid review records. Existing cache retained.');
     reviews=mergeReviews(reviews,incoming,{gameSlug:game.slug,source:isApple?'app-store':'google-play',replace:isApple});stores++;imported+=incoming.length;
    }
   }
   const changed=JSON.stringify(reviews)!==JSON.stringify(cache.data.reviews);const detail=stores?`${imported} written reviews read from ${stores} released stores.`:'No released store connections. No live reviews were requested.';
   if(changed){const saved=await service.rpc('cms_set_reviews',{p_reviews:reviews,p_detail:detail});if(saved.error)throw new Error('Review cache could not be saved.');return reply(200,{message:detail+' '+await deploy()});}
   const status=await service.from('cms_store_cache').update({updated_at:new Date().toISOString(),detail}).eq('id',true);if(status.error)throw new Error('Sync status could not be saved.');return reply(200,{message:detail+' Cached reviews unchanged; no build needed.'});
  }finally{await service.rpc('cms_release_review_lease');}
 }catch(error){return reply(400,{error:error instanceof Error?error.message:'The server job failed.'});}
});
