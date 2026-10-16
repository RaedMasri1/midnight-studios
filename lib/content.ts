import 'server-only';
import {contentSnapshotSchema,type GameRecord,type PostRecord} from './content-schema';
import gameSeed from '@/content/games.json';
import postSeed from '@/content/posts.json';
export {gameSchema,postSchema} from './content-schema';
export type {GameRecord,PostRecord} from './content-schema';
const snapshot=contentSnapshotSchema.parse({games:gameSeed,posts:postSeed});
export interface ContentRepository {
 listGames(): GameRecord[];
 listPosts(): PostRecord[];
}
// The frontend consumes a content snapshot. A CMS publish job can supply it via
// scripts/pull-content.mjs, or a server deployment can replace this repository.
const repository: ContentRepository = { listGames:()=>snapshot.games, listPosts:()=>snapshot.posts };
export const getPublishedGames=()=>repository.listGames().filter(record=>record.publication==='published');
export const getPublishedPosts=()=>repository.listPosts().filter(record=>record.publication==='published').sort((a,b)=> (b.publishedAt??'').localeCompare(a.publishedAt??''));
export const getGame=(value:string)=>getPublishedGames().find(record=>record.slug===value);
export const getPost=(value:string)=>getPublishedPosts().find(record=>record.slug===value);
export const artworkVariant=(value:string,width:number)=>value.replace('.webp',`-${width}.webp`);
export const currency=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
