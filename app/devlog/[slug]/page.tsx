import {ArticleBlock} from '../../article-block';
import { notFound } from 'next/navigation';
import { getPublishedPosts, getPost, getGame, currency, type PostRecord } from '@/lib/content';
import { pageMetadata, BreadcrumbData, StructuredData, absoluteUrl, organizationId } from '../../seo';
import { EditorialVisual, getPostMedia } from '../../studio';
import { StudioPage, TextLink } from '../../inner-page';
import { Action } from '../../cinematic-ui';
import styles from '../../inner-page.module.css';

export const dynamicParams = false;
export function generateStaticParams() { return getPublishedPosts().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const media = getPostMedia(post), image = media.type === 'video' ? media.cover : media.image;
  return pageMetadata({ title: post.seoTitle, description: post.seoDescription, path: '/devlog/' + slug, type: 'article', image: image.src, imageAlt: image.alt, imageWidth: image.width, imageHeight: image.height });
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const media = getPostMedia(post), image = media.type === 'video' ? media.cover : media.image;
  const sections: PostRecord['body'][] = [];
  for (const block of post.body) { if (block.type === 'heading' || !sections.length) sections.push([]); sections[sections.length - 1].push(block); }
  return <StudioPage active="devlog"><StructuredData data={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.summary, image: absoluteUrl(image.src), mainEntityOfPage: absoluteUrl('/devlog/' + slug), author: { '@type': 'Organization', name: 'Midnight Studios', '@id': organizationId }, publisher: { '@type': 'Organization', name: 'Midnight Studios', '@id': organizationId }, inLanguage: 'en', ...(post.publishedAt ? { datePublished: post.publishedAt } : {}) }} /><BreadcrumbData items={[["Home", "/"], ["Journal", "/devlog"], [post.cardTitle, '/devlog/' + slug]]} />
    <article className={styles.journalSurface}>
      <header className={styles.articleHero} data-theme="light"><div className="wrap"><div className={styles.articleHeader} data-page-reveal><TextLink href="/devlog">Studio journal</TextLink><h1>{post.title}</h1><div className={styles.articleMeta}><span>{post.gameSlug ? getGame(post.gameSlug)?.name : 'Inside Midnight'}</span>{post.publishedAt ? <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(post.publishedAt))}</time> : null}</div><p className={styles.articleLead}>{post.lead}</p></div><div className={`${styles.journalVisual} ${styles.articleMedia}`} data-page-reveal data-page-delay="100"><EditorialVisual media={media} /></div></div></header>
      <div className={styles.articleSections} data-theme="light">{sections.map((blocks, i) => <section className={styles.articleSection} key={i}><div className={styles.articleBody} data-page-reveal>{blocks.map((block, n) => <ArticleBlock key={n} block={block} />)}{i === sections.length - 1 && post.gameSlug ? <Action href={'/games/' + post.gameSlug}>Discover {getGame(post.gameSlug)?.name ?? 'the game'}</Action> : null}</div></section>)}</div>
    </article>
  </StudioPage>;
}
