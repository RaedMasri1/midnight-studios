import type { CSSProperties } from 'react';
import type { GameRecord } from '@/lib/content-schema';
import { triviaTilePose, triviaLayout, type WorldKind } from '@/lib/world-motion';
import { GameChapterCopy } from './game-chapter-copy';
import { WorldSequence } from './world-sequence';
import chaosSequence from '@/public/assets/idle-chaos-frames/scene.json';
import styles from './new-worlds.module.css';
import sceneStyles from './game-scenes.module.css';

export type WorldChapter = { gameSlug: string; kind: WorldKind; headline: string; conceptLabel: string; linkLabel: string; phases: [string, string, string] };
function CubeFaces() { return <>{['front', 'back', 'left', 'right', 'top', 'bottom'].map(face => <i key={face} data-face={face} />)}</>; }
function HeelScene() {
  const colors = ['#a6d6bc', '#f8e4c5', '#e996a0'];
  return <div className={`${styles.art} ${styles.heelArt}`} data-scene-art data-art="heel" role="img" aria-label="A coral high heel descends through a pastel block tower. Individual fragments break away to reveal a miniature shopping district.">
    <div className={styles.groundShadow} data-heel-shadow />
    <div className={styles.tower} aria-hidden="true">
      {[0, 1, 2].map(level => <div className={styles.block} key={level} style={{ '--level': level, '--block-color': colors[level], '--break': `var(--break-${['a', 'b', 'c'][level]})` } as CSSProperties}>
        {Array.from({ length: 8 }, (_, piece) => {
          const x = piece % 2, y = Math.floor(piece / 2) % 2, z = Math.floor(piece / 4);
          const seed = (level + 1) * 13 + piece * 7;
          return <div className={styles.fragment} key={piece} data-heel-fragment={level} style={{
            '--px': `${(x - .5) * 3.75}cqw`, '--py': `${(y - .5) * 3.75}cqw`, '--pz': `${(z - .5) * 3.75}cqw`,
            '--dx': `${(piece % 2 ? 1 : -1) * (9 + seed % 14)}cqw`,
            '--dy': `${22.5 - level * 7.5 - (y - .5) * 3.75 + (seed % 2)}cqw`,
            '--dz': `${(z ? 1 : -1) * (4 + seed % 7)}cqw`,
            '--spin': `${(piece % 2 ? 1 : -1) * (50 + seed % 150)}deg`,
          } as CSSProperties}><CubeFaces /></div>;
        })}
      </div>)}
      <div className={`${styles.block} ${styles.baseBlock}`} style={{ '--block-color': '#a6d6bc' } as CSSProperties}><CubeFaces /></div>
    </div>
    <img className={styles.shoe} data-heel-shoe src="/assets/heel-shoe.webp" srcSet="/assets/heel-shoe-480.webp 480w, /assets/heel-shoe-800.webp 800w, /assets/heel-shoe.webp 1529w" sizes="(max-width: 700px) 55vw, 40vw" width="1529" height="1029" alt="" loading="lazy" decoding="async" />
  </div>;
}
const topics = ['Gaming', 'Sports', 'Science', 'Culture'];
function TriviaScene() {
  return <div className={`${styles.art} ${styles.triviaArt}`} data-scene-art data-art="trivia" style={{ '--trivia-aspect': triviaLayout.aspect, '--trivia-anchor': `${triviaLayout.anchorY}cqw`, '--players-top': `${triviaLayout.playersTop}cqw`, '--players-height': `${triviaLayout.playerHeight}cqw`, '--player-rise': `${triviaLayout.playerRise}cqw` } as CSSProperties} role="img" aria-label="Four colorful trivia categories orbit a question mark. Friends gather as the categories form a shared challenge.">
    <div className={styles.triviaGround} /><div className={styles.rings} data-trivia-rings aria-hidden="true"><i /><i /><i /></div>
    <div className={styles.question} data-trivia-question aria-hidden="true"><span>?</span></div>
    {topics.map((topic, index) => {
      const pose = triviaTilePose(index, 1);
      return <div className={`${styles.topic} ${styles[`topic${index}`]}`} key={topic} data-trivia-tile={index} style={{
        '--tile-x': `${pose.x}cqw`, '--tile-y': `${pose.y}cqw`, '--tile-z': `${pose.z}px`, '--tile-turn': `${pose.turn}deg`, '--tile-yaw': `${pose.yaw}deg`, '--sprite-x': `${index % 2 * 100}%`, '--sprite-y': `${Math.floor(index / 2) * 100}%`,
      } as CSSProperties}><div className={styles.tileSide} /><div className={styles.tileFace}><i className={styles.topicIcon} data-trivia-icon /><span className={styles.topicName} data-trivia-icon>{topic}</span><span className={styles.answerLabel} data-trivia-answer><b>{String.fromCharCode(65 + index)}</b>{topic}</span></div></div>;
    })}
    <div className={styles.players} aria-hidden="true">{[0, 1, 2, 3].map(i => <div className={styles.player} key={i} data-player-avatar={i} style={{ '--player': i, '--avatar-x': `${i * 100 / 3}%` } as CSSProperties}><span className={styles.playerArt} /></div>)}</div>
    <span className={styles.sparkOne} data-trivia-spark /><span className={styles.sparkTwo} data-trivia-spark /><span className={styles.sparkThree} data-trivia-spark />
  </div>;
}
function ChaosScene({ id }: { id: string }) {
  return <div className={`${styles.art} ${styles.chaosArt}`} data-scene-art data-art="chaos" role="img" aria-label="A miniature island city progresses from a calm breeze through a growing tornado to a storm with lightning and a glowing fissure.">
    <img src={chaosSequence.poster} width={chaosSequence.desktop.width} height={chaosSequence.desktop.height} alt="" className={styles.chaosPoster} loading="lazy" decoding="async" />
    <WorldSequence sectionId={id} source={{ count: chaosSequence.frameCount, width: chaosSequence.desktop.width, height: chaosSequence.desktop.height, base: chaosSequence.desktop.path.replace(/\/$/, ''), mobileBase: chaosSequence.mobile.path.replace(/\/$/, ''), revision: chaosSequence.revision }} />
  </div>;
}
export function NewWorlds({ chapters }: { chapters: (WorldChapter & { game: GameRecord })[] }) {
  return <>{chapters.map((chapter, index) => {
    const id = `world-${chapter.game.slug}`, dark = chapter.kind === 'chaos';
    return <section key={id} id={id} className={`${styles.chapter} ${styles[chapter.kind]} ${sceneStyles.scene}`} data-game-scene={chapter.kind} data-copy-side={index % 2 === 0 ? 'right' : 'left'} data-cinematic={chapter.kind} data-pin="true" data-theme={dark ? undefined : 'light'} aria-labelledby={`${id}-heading`}>
      <div className={styles.stage} data-stage>
        {chapter.kind === 'heel' ? <picture className={styles.heelPanorama} aria-hidden="true"><source media="(max-width: 700px)" srcSet="/assets/heel-district-mobile.webp" /><source media="(max-width: 1400px) and (orientation: portrait)" srcSet="/assets/heel-district-tablet.webp" /><img src="/assets/heel-district-desktop.webp" width="1983" height="793" alt="" loading="lazy" decoding="async" /></picture> : null}
        <div className={`wrap ${styles.layout}`} data-scene-layout>
          <GameChapterCopy game={chapter.game} headingId={`${id}-heading`} description={chapter.headline} light={dark} />
          <div className={styles.visual} data-scene-visual>{chapter.kind === 'heel' ? <HeelScene /> : chapter.kind === 'trivia' ? <TriviaScene /> : <ChaosScene id={id} />}</div>
        </div>
        <div className={`wrap ${styles.bottom}`} data-scene-meta><p>{chapter.conceptLabel}</p><div className={styles.phaseLabels} aria-hidden="true">{chapter.phases.map((phase, i) => <span key={phase} data-world-phase={i}>{phase}</span>)}</div><div className={styles.rail} aria-hidden="true"><i data-world-rail /></div></div>
      </div>
    </section>;
  })}</>;
}
