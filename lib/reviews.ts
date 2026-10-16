import 'server-only';
import {z} from 'zod';
import reviewSeed from '@/content/reviews.json';
import {reviewSchema} from './game-page-schema';
import {getPublishedGames} from './content';
const reviews=z.array(reviewSchema).parse(reviewSeed);
const seen=new Set<string>();
for(const review of reviews){
 const key=review.gameSlug+':'+review.source+':'+review.id;
 if(seen.has(key))throw new Error('Duplicate review source/id: '+key);seen.add(key);
 if(!getPublishedGames().some(game=>game.slug===review.gameSlug))throw new Error('Review references an unpublished game');
}
// Replace with a server-side database query when authenticated website reviews open.
// Imported store feedback is cached at build time, never fetched with browser credentials.
export const getGameReviews=(slug:string)=>reviews.filter(review=>review.gameSlug===slug).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
