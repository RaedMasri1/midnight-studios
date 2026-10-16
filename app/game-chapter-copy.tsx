import type { GameRecord } from '@/lib/content-schema';
import { Action } from './cinematic-ui';
import styles from './game-scenes.module.css';

/** All homepage games share the same status, genre, title, description and action. */
export function GameChapterCopy({ game, headingId, description, light = false }: { game: GameRecord; headingId: string; description: string; light?: boolean }) {
  return <div className={styles.copy} data-scene-copy data-fit-content>
    <span className={styles.status} data-game-status>{game.status === 'Released' ? game.page.availableStatusLabel : game.page.statusLabel}</span>
    <p className={styles.genre}>{game.genre}</p>
    <h2 id={headingId} translate="no">{game.name}</h2>
    <p className={styles.description}>{description}</p>
    <Action href={`/games/${game.slug}`} light={light}>Explore the game</Action>
  </div>;
}
