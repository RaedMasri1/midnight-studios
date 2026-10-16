import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Header, BrandArt, StudioPicture, getGameArtwork } from './studio';
import { HomeMotion } from './home-motion';
import { getHomeContent } from '@/lib/home';
import { getGame, getPublishedPosts, getPublishedGames } from '@/lib/content';
import styles from './homepage.module.css';
import sceneStyles from './game-scenes.module.css';
import { Arrow, Action, CinematicFooter } from './cinematic-ui';
import { NewWorlds } from './new-worlds';
import { JournalCard, JournalGrid } from './journal';
import { selectJournal } from '@/lib/journal';
import journalStyles from './journal.module.css';
import { GameChapterCopy } from './game-chapter-copy';

function Paper({ type, className }: { type: number; className: string }) {
  return <div className={`${styles.paper} ${className}`} data-paper={type} style={{ '--cell': type } as CSSProperties}>
    <i className={styles.paperPrint} />
  </div>;
}
function PopUpBook() {
  return <div className={styles.bookScene} data-scene-visual data-art="book-stage" role="img" aria-label="An illustrated Dreamward pop-up book. Its cover opens, then mountains, a castle and waterfall islands rise from the pages as you scroll.">
    <div className={styles.bookShadow} />
    <div className={styles.bookComposition} data-book-composition data-art="book"><div className={styles.book} data-book-base>
      <div className={styles.pageRight}><div className={styles.printedMap} /><div className={styles.pageGrain} />
      </div>
      <div className={styles.pageLeft}>
        <div className={styles.coverFace} data-book-cover><span>Midnight Studios</span><span className={styles.coverMark}><BrandArt /></span><strong>Dreamward</strong><span>A world waiting to unfold.</span></div>
        <div className={styles.printedMap} /><div className={styles.pageGrain} />
      </div>
      <div className={styles.bookGutter} />
      </div>
      <div className={styles.bookWorld} data-book-world>
        <Paper type={0} className={styles.mountainsLeft} /><Paper type={1} className={styles.castle} />
        <Paper type={2} className={styles.waterfall} /><Paper type={3} className={styles.islandRight} />
      </div>
    </div>
  </div>;
}
export default function Home() {
  const home = getHomeContent();
  const primary = home.feature.enabled ? getGame(home.feature.gameSlug) : undefined;
  const secondary = home.secondaryFeature.enabled ? getGame(home.secondaryFeature.gameSlug) : undefined;
  const screenshots = home.feature.tabletScreenshots ?? primary?.page.screenshots.slice(0, 2) ?? [];
  const journal = selectJournal(getPublishedPosts(), { homepage: true, featuredSlug: home.journal.postSlug, limit: home.journal.homepageLimit });
  const chapters = home.upcomingChapters.flatMap(chapter => { const game = getGame(chapter.gameSlug); return game ? [{ ...chapter, game }] : []; });
  const moreGames = getPublishedGames().filter(game => game.slug !== primary?.slug && game.slug !== secondary?.slug && !chapters.some(chapter => chapter.game.slug === game.slug));
  return <><Header active="home" /><HomeMotion /><main id="main" className={styles.home}>
    <section id="top" className={styles.hero} data-cinematic="hero" data-pin="true" aria-labelledby="home-heading">
      <div className={styles.heroStage} data-stage>
        <div className={styles.portalScene} aria-hidden="true">
          <picture className={styles.portalPicture}>
            {home.hero.mobileEnvironment ? <source media="(max-width: 700px)" srcSet={[...(home.hero.mobileEnvironment.variants ?? []), { src: home.hero.mobileEnvironment.src, width: home.hero.mobileEnvironment.width }].sort((a, b) => a.width - b.width).map(v => `${v.src} ${v.width}w`).join(', ')} sizes="100vw" width={home.hero.mobileEnvironment.width} height={home.hero.mobileEnvironment.height} /> : null}
            {home.hero.tabletEnvironment ? <source media="(max-width: 1100px), (max-width: 1400px) and (orientation: portrait)" srcSet={[...(home.hero.tabletEnvironment.variants ?? []), { src: home.hero.tabletEnvironment.src, width: home.hero.tabletEnvironment.width }].sort((a, b) => a.width - b.width).map(v => `${v.src} ${v.width}w`).join(', ')} sizes="100vw" width={home.hero.tabletEnvironment.width} height={home.hero.tabletEnvironment.height} /> : null}
            <img className={styles.portalEnvironment} src={home.hero.environment.src} srcSet={home.hero.environment.variants?.map(v => `${v.src} ${v.width}w`).concat(`${home.hero.environment.src} ${home.hero.environment.width}w`).join(', ')} sizes="100vw" width={home.hero.environment.width} height={home.hero.environment.height} alt="" fetchPriority="high" loading="eager" decoding="async" />
          </picture>
          <img className={styles.portalCharacter} src={home.hero.character.src} width={home.hero.character.width} height={home.hero.character.height} alt="" loading="eager" decoding="async" />
        </div>
        <div className={styles.heroVignette} aria-hidden="true" />
        <div className={`wrap ${styles.heroInner}`} data-hero-inner>
          <div className={styles.heroMark} aria-hidden="true"><BrandArt /></div>
          <div className={styles.heroCopy} data-hero-copy><div><p className={styles.brandSubtitle}>{home.hero.subtitle ? <span>{home.hero.subtitle}</span> : null}<span>{home.hero.description}</span></p><h1 id="home-heading">{home.hero.lines.map((line, i) => <span key={line}>{i > 0 ? ' ' : ''}{line}</span>)}</h1></div><div className={styles.heroSupport}><div className={styles.heroActions}><Action href={primary ? '#games' : '/games'} light>{home.hero.primaryLabel}</Action><Link prefetch={false} className={styles.inlineLink} href="#studio">{home.hero.secondaryLabel}<Arrow /></Link></div></div></div>
          <a className={styles.scrollHint} href={primary ? '#games' : '/games'}>{home.hero.scrollLabel}<span aria-hidden="true" /></a>
        </div>
        <div className={styles.heroWhiteout} aria-hidden="true" />
        <div className={styles.scrollRail} aria-hidden="true"><i /></div>
      </div>
    </section>
    {primary ? <section id="games" className={`${styles.jump} ${sceneStyles.scene}`} data-game-scene="jump" data-copy-side="right" data-cinematic="jump" data-pin="true" data-theme="light" aria-labelledby="jump-heading"><div className={styles.jumpStage} data-stage><div className={`wrap ${styles.jumpLayout}`} data-scene-layout>
      <GameChapterCopy game={primary} headingId="jump-heading" description={home.feature.description} />
      <div data-scene-visual><div className={styles.tabletScene} data-scene-art data-art="devices"><div className={styles.orbit} aria-hidden="true" /><div className={styles.platform} aria-hidden="true" />{screenshots.map((shot, index) => <figure className={`${styles.tablet} ${index === 0 ? styles.tabletFront : styles.tabletRear}`} key={shot.src}><div className={styles.tabletCamera} aria-hidden="true" /><div className={styles.tabletScreen}><StudioPicture image={{ ...shot, fit: 'contain', position: '50% 50%' }} sizes="(max-width: 700px) 44vw, 32vw" /></div><div className={styles.tabletRim} aria-hidden="true" /></figure>)}</div></div>
    </div><div className="wrap" data-scene-meta><p>{home.feature.mediaLabel}</p></div></div></section> : null}
    {secondary ? <section className={`${styles.dream} ${sceneStyles.scene}`} data-game-scene="dream" data-copy-side="left" data-cinematic="dream" data-pin="true" aria-labelledby="dream-heading"><div className={styles.dreamStage} data-stage>
      <div className="wrap" data-scene-layout>
        <GameChapterCopy game={secondary} headingId="dream-heading" description={home.secondaryFeature.description} light />
        <PopUpBook />
      </div>
      <div className={`wrap ${styles.dreamBottom}`} data-scene-meta><p>Concept artwork</p><div className={styles.bookProgress} aria-hidden="true"><span /><i /></div></div>
    </div></section> : null}
    <NewWorlds chapters={chapters} />
    <section id="studio" className={styles.craft} data-cinematic="craft" data-pin="true" data-theme="light" aria-labelledby="studio-heading"><div className={styles.craftStage} data-stage>
      <img className={styles.studioFloor} src="/assets/studio-floor.webp" width="1672" height="941" alt="" loading="lazy" decoding="async" />
      <div className={styles.studioScene} role="img" aria-label="From sketch to character: an orange puppy with a polygon mesh half, a gray cat, and separate drawing sheets on a white studio floor.">
        <div className={styles.studioObjects}>
        <div className={styles.characterShadow} aria-hidden="true" />
        <img className={styles.studioSketch} src="/assets/studio-sketch.webp" width="1536" height="1024" sizes="(max-width: 700px) 65vw, 46vw" alt="" loading="lazy" decoding="async" />
        <img className={styles.studioCat} src="/assets/studio-cat.webp" width="1191" height="1321" sizes="(max-width: 700px) 65vw, 46vw" alt="" loading="lazy" decoding="async" />
        <img className={styles.studioDog} src="/assets/studio-dog.webp" width="1161" height="1354" sizes="(max-width: 700px) 65vw, 46vw" alt="" loading="lazy" decoding="async" />
        <img className={styles.studioTools} src="/assets/studio-tools.webp" width="1536" height="1024" sizes="(max-width: 700px) 65vw, 46vw" alt="" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className={styles.studioHeading}><h2 id="studio-heading">{home.studio.title}</h2></div><div className={styles.studioSupport}><p>{home.studio.paragraphs.join(' ')}</p><Link prefetch={false} href="/about" className={styles.inlineLink}>{home.studio.linkLabel}<Arrow /></Link></div>
      <div className={styles.timeline} role="list" aria-label="Our creative process">{home.studio.process.map((step, i) => <div key={step.title} data-step={i} data-active={i === 1} role="listitem"><span className={styles.timelineDot} aria-hidden="true" /><span>{step.title}</span><i className={styles.timelineLine} aria-hidden="true" /></div>)}<p>{home.studio.process.map((step, i) => <span key={step.title} data-phase-caption={i} hidden={i !== 1}>{step.description} · Just Jump!</span>)}</p></div>
    </div></section>
    {moreGames.length ? <section className={styles.moreGames} aria-labelledby="more-heading"><div className="wrap"><h2 id="more-heading">More worlds in the making.</h2><div className={styles.moreGrid}>{moreGames.map(game => <Link prefetch={false} href={`/games/${game.slug}`} key={game.slug}><StudioPicture image={getGameArtwork(game)} /><h3>{game.name}</h3><p>{game.description}</p></Link>)}</div></div></section> : null}
    {home.journal.enabled && journal.featured ? <section id="journal" className={journalStyles.section} data-cinematic="journal" data-theme="light" aria-labelledby="journal-heading"><div className="wrap"><div className={journalStyles.heading} data-home-reveal><div><p className={journalStyles.eyebrow}>{home.journal.eyebrow}</p><h2 id="journal-heading">{home.journal.title}</h2><p className={journalStyles.subheading}>{home.journal.subtitle}</p></div><Link prefetch={false} href="/devlog" className={journalStyles.catalogue}>{home.journal.catalogueLabel}<Arrow /></Link></div><JournalCard post={journal.featured} featured homeReveal readLabel={home.journal.imageLinkLabel} featuredLabel={home.journal.featuredLabel} /><JournalGrid posts={journal.remaining} homeReveal readLabel={home.journal.imageLinkLabel} /></div></section> : null}
  </main><CinematicFooter /></>;
}
