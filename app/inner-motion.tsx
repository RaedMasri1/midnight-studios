'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Reveal complete compositions on entry; content stays readable without JS. */
export function useInnerMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const pending = new Map<Element, Animation>();
    let observer: IntersectionObserver | undefined;
    function reset() {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      pending.clear();
      document.querySelectorAll<HTMLElement>('[data-mail-art]').forEach(el => delete el.dataset.inView);
      if (reduced.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (el.hasAttribute('data-mail-art')) el.dataset.inView = String(entry.isIntersecting);
          if (!entry.isIntersecting) continue;
          pending.get(el)?.play();
          pending.delete(el);
          if (el.hasAttribute('data-mail-art')) continue;
          observer!.unobserve(el);
        }
      }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
      document.querySelectorAll<HTMLElement>('[data-page-reveal]').forEach(el => {
        const media = el.dataset.pageReveal === 'media';
        const animation = el.animate([
          { opacity: 0, transform: `translate3d(0,${media ? 42 : 28}px,0) scale(${media ? .96 : 1})` },
          { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
        ], { duration: media ? 1200 : 1000, delay: Number(el.dataset.pageDelay ?? 0), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
        animation.pause();
        animations.add(animation);
        pending.set(el, animation);
        animation.onfinish = () => { pending.delete(el); if (!el.hasAttribute('data-mail-art')) observer?.unobserve(el); animation.cancel(); animations.delete(animation); };
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
