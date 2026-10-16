import { pageMetadata, BreadcrumbData } from '../seo';
import { StudioPage, StudioComposition, TextLink } from '../inner-page';
import styles from '../inner-page.module.css';
import opening from '../page-openings.module.css';

export const metadata = pageMetadata({ title: 'About Our Doha Game Studio | Midnight Studios', description: 'Meet Midnight Studios, an independent game development studio in Doha, Qatar. Discover the ambition, craft, and story behind Just Jump! and Dreamward.', path: '/about' });
const values = [
  ['Make it worth playing.', 'Characters, environments, sound, and the small details that make a game feel good in your hands.'],
  ['Keep the story honest.', 'Share the decisions, redesigns, costs, and lessons while the games are still taking shape.'],
  ['Build beyond the first game.', 'Carry what we learn from Just Jump! into the worlds that come next.'],
];
export default function About() {
  return <StudioPage active="about"><BreadcrumbData items={[["Home", "/"], ["Studio", "/about"]]} />
    <section className={`${styles.aboutHero} ${styles.light} ${opening.aboutOpening}`} data-theme="light" aria-labelledby="about-heading"><div className={`wrap ${styles.aboutHeroLayout}`} data-about-layout><div data-page-reveal><p className={styles.label}>About Midnight Studios</p><h1 id="about-heading">Play is in<br />the details.</h1><p>An independent mobile game studio in Doha, Qatar, building Just Jump!, Dreamward, and the worlds that come next.</p></div><StudioComposition /></div></section>
    <section className={`${styles.section} ${styles.light}`} data-theme="light"><div className={`wrap ${styles.storyLayout}`}><div data-page-reveal><p className={styles.label}>The first chapter</p><h2 className={styles.sectionTitle}>From small ideas<br />to worlds of play.</h2></div><div className={styles.storyCopy} data-page-reveal data-page-delay="80"><p>Before Just Jump!, smaller projects taught us how to turn an idea into a game.</p><p>Just Jump! grew from a simple jumping game into two years of development with a developer and an artist—bringing its characters, worlds, and small details to life.</p><p>Now we’re building the next games and sharing the decisions, redesigns, and lessons along the way.</p><TextLink href="/games">Meet our games</TextLink></div></div></section>
    <section className={styles.quoteScene}><img src="/assets/journal-forest.webp" width="1672" height="941" alt="" loading="lazy" decoding="async" /><div className="wrap" data-page-reveal><blockquote>“I want to document it<br />while it’s happening.”</blockquote><p>From the studio’s first video</p></div></section>
    <section className={`${styles.section} ${styles.cream}`} data-theme="light"><div className="wrap"><div className={styles.sectionHead} data-page-reveal><h2 className={styles.sectionTitle}>Care in every detail.</h2><TextLink href="/devlog">Read the studio journal</TextLink></div><div className={styles.values}>{values.map(([title, text], i) => <article key={title} data-page-reveal data-page-delay={i * 75}><span className={styles.valueNumber}>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
  </StudioPage>;
}
