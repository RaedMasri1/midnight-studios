import { getPublishedPosts } from '@/lib/content';
import { getHomeContent } from '@/lib/home';
import { selectJournal } from '@/lib/journal';
import { pageMetadata, BreadcrumbData } from '../seo';
import { StudioPage } from '../inner-page';
import { JournalCard, JournalGrid } from '../journal';
import styles from '../journal.module.css';

export const metadata = pageMetadata({ title: 'Game Development Journal | Midnight Studios', description: 'Follow the development of Midnight Studios games. Read honest stories about mobile game design, development costs, redesigns, and building an independent studio.', path: '/devlog' });
export default function Devlog() {
  const config = getHomeContent().journal;
  const journal = selectJournal(getPublishedPosts(), { featuredSlug: config.postSlug });
  return <StudioPage active="devlog"><BreadcrumbData items={[["Home", "/"], ["Journal", "/devlog"]]} />
    <div className={styles.page} data-theme="light" data-journal-page>
      <section className={styles.pageHeading} aria-labelledby="journal-page-heading"><div className="wrap" data-page-reveal><p className={styles.eyebrow}>Inside Midnight</p><h1 id="journal-page-heading">Studio journal.</h1><p className={styles.subheading}>The decisions, redesigns, and lessons behind our games.</p></div></section>
      <div className="wrap">
        {journal.featured ? <div data-page-reveal><JournalCard post={journal.featured} featured headingLevel="h2" readLabel={config.imageLinkLabel} featuredLabel={config.featuredLabel} /></div> : <div className={styles.empty}><h2>The next story is in the making.</h2><p>Development stories will appear here when they’re published.</p></div>}
        {journal.remaining.length ? <section className={styles.more} aria-labelledby="more-stories-heading"><h2 id="more-stories-heading" data-page-reveal>More from the studio.</h2><JournalGrid posts={journal.remaining} readLabel={config.imageLinkLabel} /></section> : null}
      </div>
    </div>
  </StudioPage>;
}
