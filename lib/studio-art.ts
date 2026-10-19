// Same artwork, smaller delivery copies. Originals remain available for large
// displays, and CMS replacements continue to use their own source unchanged.
const widths: Record<string, number> = {
  'hero-puppy': 1236, 'studio-dog': 1161, 'studio-cat': 1191,
  'studio-sketch': 1536, 'studio-tools': 1536,
};
export function studioArtProps(src: string, sizes: string) {
  const name = src.match(/^\/assets\/([a-z-]+)\.webp$/)?.[1];
  if (!name || !widths[name]) return {};
  return { srcSet: `/assets/${name}-480.webp 480w, /assets/${name}-800.webp 800w, ${src} ${widths[name]}w`, sizes };
}
