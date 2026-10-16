import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {z} from 'zod';
import {storesSchema,gamePageSchema,reviewSchema} from '../lib/game-page-schema.ts';
import {fetchAppleReviews,fetchGoogleReviews,mergeReviews} from './store-review-import.mjs';
const root=path.dirname(fileURLToPath(new URL('../package.json',import.meta.url)));
const selected=process.argv[2];
try{
 const games=JSON.parse(await fs.readFile(path.join(root,'content/games.json'),'utf8'));
 if(selected&&!games.some(game=>game.slug===selected))throw new Error('Unknown game slug');
 const file=path.join(root,'content/reviews.json');
 let reviews=z.array(reviewSchema).parse(JSON.parse(await fs.readFile(file,'utf8')));
 let changed=false;
 for(const game of games.filter(g=>g.publication==='published'&&(!selected||g.slug===selected))){
  const stores=storesSchema.parse(game.stores);gamePageSchema.parse(game.page);
  if(game.status!=='Released'){console.log(`${game.slug}: coming soon; no store requests.`);continue;}
  for(const [key,store] of Object.entries(stores)){
   if(!store.released)continue;
   const apple=key==='appStore',id=apple?store.appId:store.packageName;
   const token=process.env[apple?'APP_STORE_CONNECT_TOKEN':'GOOGLE_PLAY_ACCESS_TOKEN'];
   if(!id||!token)throw new Error(`${game.slug}: set ${apple?'appId and APP_STORE_CONNECT_TOKEN':'packageName and GOOGLE_PLAY_ACCESS_TOKEN'} before syncing.`);
   const incoming=z.array(reviewSchema).parse(await (apple?fetchAppleReviews(id,token,game.slug):fetchGoogleReviews(id,token,game.slug)));
   reviews=mergeReviews(reviews,incoming,{gameSlug:game.slug,source:apple?'app-store':'google-play',replace:apple});changed=true;
   console.log(`${game.slug}: imported ${incoming.length} ${apple?'App Store':'Google Play'} written reviews.`);
  }
 }
 if(changed){const temporary=file+'.tmp';await fs.writeFile(temporary,JSON.stringify(reviews,null,2)+'\n',{mode:0o600});await fs.rename(temporary,file);console.log('Review cache updated. Rebuild the website to publish it.');}
}catch(error){console.error(error instanceof Error?error.message:'Store import failed');process.exitCode=1;}
