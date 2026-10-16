import Link from 'next/link';
import type { ReactNode } from 'react';
import { Header } from './studio';
import { HomeMotion } from './home-motion';
import { Arrow, CinematicFooter } from './cinematic-ui';
import styles from './inner-page.module.css';

export function StudioPage({ active, children }: { active: string; children: ReactNode }) {
  return <div className={styles.shell} data-studio-page={active}><Header active={active} /><HomeMotion /><main id="main" className={styles.main}><div id="top" />{children}</main><CinematicFooter /></div>;
}
export function PageHeading({ label, title, description, children, light = false }: { label: string; title: ReactNode; description: string; children?: ReactNode; light?: boolean }) {
  return <section className={`${styles.heading} ${light ? styles.light : ''}`} data-theme={light ? 'light' : undefined}><div className="wrap"><p className={styles.label} data-page-reveal>{label}</p><div className={styles.headingRow} data-page-reveal data-page-delay="70"><h1>{title}</h1><p>{description}</p></div>{children}</div></section>;
}
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link prefetch={false} href={href} className={styles.textLink}>{children}<Arrow /></Link>;
}
export function StudioComposition() {
  return <div className={styles.studioComposition} data-about-art role="img" aria-label="An orange puppy with a mesh half, a gray cat and separate sketch sheets on the studio floor.">
    <img className={styles.floor} src="/assets/studio-floor.webp" width="1672" height="941" alt="" loading="eager" decoding="async" />
    <div className={styles.sketch} data-page-reveal><img src="/assets/studio-sketch.webp" width="1536" height="1024" alt="" loading="eager" decoding="async" /></div>
    <div className={styles.cat} data-about-cat data-page-reveal data-page-delay="160"><img src="/assets/studio-cat.webp" width="1191" height="1321" alt="" loading="eager" decoding="async" /></div>
    <div className={styles.dog} data-about-dog data-page-reveal data-page-delay="80"><img src="/assets/studio-dog.webp" width="1161" height="1354" alt="" loading="eager" decoding="async" /></div>
    <div className={styles.tools} data-page-reveal data-page-delay="230"><img src="/assets/studio-tools.webp" width="1536" height="1024" alt="" loading="eager" decoding="async" /></div>
  </div>;
}
export function PortalArt({ defer = false }: { defer?: boolean }) {
  return <div className={styles.portalArt} aria-hidden="true"><img src="/assets/portal-cave.webp" srcSet="/assets/portal-cave-960.webp 960w, /assets/portal-cave-1280.webp 1280w, /assets/portal-cave.webp 1672w" sizes="100vw" width="1672" height="940" alt="" loading={defer ? 'lazy' : 'eager'} fetchPriority={defer ? 'low' : 'high'} decoding="async" /></div>;
}
