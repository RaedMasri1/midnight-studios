'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Reveal complete compositions on entry; content stays readable without JS. */
export function useInnerMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const revealed = new Set<Element>();
    let observer: IntersectionObserver | undefined;
    function reset() {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      document.querySelectorAll<HTMLElement>('[data-mail-art]').forEach(el => delete el.dataset.inView);
      if (reduced.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (el.hasAttribute('data-mail-art')) el.dataset.inView = String(entry.isIntersecting);
          if (!entry.isIntersecting) continue;
          // Start on entry rather than pausing an opacity:0 animation before
          // intersection. The first screen stays visible during hydration.
          if (el.hasAttribute('data-page-reveal') && !revealed.has(el)) {
            revealed.add(el);
            const media = el.dataset.pageReveal === 'media';
            const animation = el.animate([
              { opacity: .85, transform: `translate3d(0,${media ? 20 : 14}px,0) scale(${media ? .985 : 1})` },
              { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
            ], { duration: 450, delay: Math.min(80, Number(el.dataset.pageDelay ?? 0)), easing: 'cubic-bezier(.16,1,.3,1)' });
            animations.add(animation);
            animation.onfinish = () => { animation.cancel(); animations.delete(animation); };
          }
          if (el.hasAttribute('data-mail-art')) continue;
          observer!.unobserve(el);
        }
      }, { threshold: 0, rootMargin: '0px 0px 15% 0px' });
      document.querySelectorAll<HTMLElement>('[data-page-reveal]').forEach(el => {
        observer!.observe(el);
      });
    }
    function focus(event: FocusEvent) {
      const target = event.target;
      animations.forEach(animation => {
        const element = (animation.effect as KeyframeEffect | null)?.target;
        if (element instanceof Element && target instanceof Node && element.contains(target)) animation.finish();
      });
    }
    reset();
    reduced.addEventListener('change', reset);
    document.addEventListener('focusin', focus);
    return () => { observer?.disconnect(); animations.forEach(animation => animation.cancel()); reduced.removeEventListener('change', reset); document.removeEventListener('focusin', focus); };
  }, [pathname]);
  return null;
}
