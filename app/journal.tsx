import Link from 'next/link';
import { getGame, type PostRecord } from '@/lib/content';
import { StudioPicture, getPostMedia } from './studio';
import { Arrow } from './cinematic-ui';
import styles from './journal.module.css';

export function JournalCard({ post, featured = false, homeReveal = false, readLabel = 'Read the story', featuredLabel = 'Featured story', headingLevel = 'h3' }: { post: PostRecord; featured?: boolean; homeReveal?: boolean; readLabel?: string; featuredLabel?: string; headingLevel?: 'h2' | 'h3' }) {
  const media = getPostMedia(post), image = media.type === 'video' ? media.cover : media.image;
  const game = post.gameSlug ? getGame(post.gameSlug) : undefined;
  const href = `/devlog/${post.slug}`;
  const Heading = headingLevel;
  return <article className={`${styles.card} ${featured ? styles.feature : styles.compact}`} data-journal-card={post.slug} data-home-reveal={homeReveal || undefined} aria-labelledby={`story-${post.slug}`}>
    <figure className={styles.media}>
      <Link prefetch={false} href={href} className={styles.imageLink} aria-label={`Read ${post.cardTitle}`}><StudioPicture image={image} sizes={featured ? '(max-width: 760px) calc(100vw - 40px), 56vw' : '(max-width: 760px) calc(100vw - 40px), 44vw'} /></Link>
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
      {media.type === 'video' ? <span className={styles.videoTag}>Video story</span> : null}
    </figure>
    <div className={styles.body}>
      <div className={styles.meta}><span className={styles.chip}>{game?.name ?? 'Inside Midnight'} · {post.category}</span>{post.publishedAt ? <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(post.publishedAt))}</time> : null}</div>
      {featured ? <p className={styles.featuredLabel}>{featuredLabel}</p> : null}
      <Heading id={`story-${post.slug}`}><Link prefetch={false} href={href}>{post.cardTitle}</Link></Heading>
      <p className={styles.summary}>{post.summary}</p>
      <Link prefetch={false} href={href} className={styles.readLink}>{readLabel}<span><Arrow /></span></Link>
    </div>
  </article>;
}

export function JournalGrid({ posts, homeReveal = false, readLabel = 'Read the story' }: { posts: PostRecord[]; homeReveal?: boolean; readLabel?: string }) {
  if (!posts.length) return null;
  return <div className={styles.grid} data-home-reveal={homeReveal || undefined}>{posts.map(post => <JournalCard key={post.slug} post={post} readLabel={readLabel} />)}</div>;
}
