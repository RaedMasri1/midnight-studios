type JournalRecord = { slug: string; publication: 'draft' | 'published'; publishedAt?: string; showOnHomepage?: boolean };
type JournalOptions = { homepage?: boolean; featuredSlug?: string | null; limit?: number };

/** One ordered, unique selection drives both surfaces; homepage visibility never unpublishes a post. */
export function selectJournal<T extends JournalRecord>(records: readonly T[], options: JournalOptions = {}) {
  const seen = new Set<string>();
  const eligible = records.filter(post => {
    if (post.publication !== 'published' || (options.homepage && post.showOnHomepage === false) || seen.has(post.slug)) return false;
    seen.add(post.slug); return true;
  }).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  const preferred = eligible.find(post => post.slug === options.featuredSlug) ?? eligible[0];
  const ordered = preferred ? [preferred, ...eligible.filter(post => post.slug !== preferred.slug)] : [];
  const limit = options.limit === undefined ? ordered.length : Math.max(0, Math.floor(options.limit));
  const items = ordered.slice(0, limit);
  return { featured: items[0] as T | undefined, remaining: items.slice(1), items, total: eligible.length };
}
