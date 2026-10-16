import Link from 'next/link';
import { pageMetadata, BreadcrumbData, StructuredData, absoluteUrl } from '../seo';
import { StudioPicture, getGameArtwork, games } from '../studio';
import { StudioPage, TextLink } from '../inner-page';
import { Action } from '../cinematic-ui';
import styles from '../inner-page.module.css';
import opening from '../page-openings.module.css';
import type { GameRecord } from '@/lib/content-schema';

function GameFeature({ game, index }: { game: GameRecord; index: number }) {
  const image = getGameArtwork(game);
  return <section className={`${styles.gameFeature} ${index % 2 ? styles.featureDark : styles.light}`} data-game-index={index} data-theme={index % 2 ? undefined : 'light'} aria-labelledby={`game-${game.slug}`}><div className={`wrap ${styles.featureLayout}`}>
    <figure data-page-reveal="media"><Link prefetch={false} href={`/games/${game.slug}`} aria-label={`Explore ${game.name}`}><StudioPicture image={image} sizes="(max-width: 700px) calc(100vw - 40px), 55vw" /></Link>{image.caption ? <figcaption>{image.caption}</figcaption> : null}</figure>
    <div className={styles.featureCopy} data-page-reveal="copy" data-page-delay="140"><p>{game.genre}</p><h2 id={`game-${game.slug}`} translate="no">{game.name}</h2><p>{game.description}</p><Action href={`/games/${game.slug}`} light={index % 2 === 1}>Explore the game</Action><span className={styles.status}>{game.status === 'Released' ? game.page.availableStatusLabel : game.page.statusLabel}</span></div>
  </div></section>;
}

export const metadata = pageMetadata({ title: 'Mobile Games in Development | Midnight Studios', description: 'Discover Just Jump!, Dreamward, Tadri, Break the Heel! and Idle Chaos. Explore five mobile game worlds in development at Midnight Studios.', path: '/games' });
export default function Games() {
  const pairs = Array.from({ length: Math.ceil(Math.max(0, games.length - 1) / 2) }, (_, i) => games.slice(1 + i * 2, 3 + i * 2));
  return <StudioPage active="games"><StructuredData data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Midnight Studios Games', url: absoluteUrl('/games'), mainEntity: { '@type': 'ItemList', itemListElement: games.map((game, i) => ({ '@type': 'ListItem', position: i + 1, name: game.name, url: absoluteUrl('/games/' + game.slug) })) } }} /><BreadcrumbData items={[["Home", "/"], ["Games", "/games"]]} />
    <section className={opening.collection} data-theme="light" aria-labelledby="games-heading"><div className={`wrap ${opening.collectionLayout}`}>
      <div className={opening.collectionCopy} data-page-reveal><p className={opening.eyebrow}>The collection · {games.length} worlds in development</p><h1 id="games-heading">Our games.<br />Your next adventure.</h1><p>From one more jump to a growing storm, explore the games taking shape at Midnight Studios.</p><TextLink href="#collection">Explore the collection</TextLink></div>
      <div className={opening.collectionArt} data-page-reveal data-page-delay="80" aria-label="Explore Midnight Studios games">{games.slice(0,5).map((game,i)=><Link prefetch={false} className={opening.cover} data-cover-index={i % 5} key={game.slug} href={`/games/${game.slug}`} aria-label={`Explore ${game.name}`}><StudioPicture image={getGameArtwork(game)} sizes="(max-width: 700px) 45vw, 25vw" /><span>{game.name}</span></Link>)}</div>
    </div></section>
    <div id="collection">{games[0] ? <GameFeature game={games[0]} index={0} /> : null}{pairs.map((pair, pairIndex) => <div className={styles.gamePair} data-game-pair key={pair[0].slug}>{pair.map((game, index) => <GameFeature key={game.slug} game={game} index={1 + pairIndex * 2 + index} />)}</div>)}</div>
    <section className={`${styles.section} ${styles.cream}`} data-theme="light"><div className={`wrap ${styles.catalogueNote}`} data-page-reveal><h2>The story behind<br />the games.</h2><TextLink href="/devlog">Follow our progress</TextLink></div></section>
  </StudioPage>;
}
