import 'server-only';
import seed from '@/content/home.json';
import {homeSchema} from './home-schema';
import {getPublishedGames} from './content';
export {homeSchema} from './home-schema';
export const getHomeContent=()=>{
 const home=homeSchema.parse(seed), published=new Set(getPublishedGames().map(game=>game.slug));
 for(const chapter of home.upcomingChapters)if(!published.has(chapter.gameSlug))throw new Error('Homepage chapter references a missing published game: '+chapter.gameSlug);
 return home;
};
