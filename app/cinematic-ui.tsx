import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandArt } from './studio';
import { MoonMotionToggle } from './home-motion';
import { FooterSupport } from './footer-support';
import styles from './homepage.module.css';
import footerStyles from './footer.module.css';

export function Arrow({ circle = false }: { circle?: boolean }) {
  return <span className={circle ? styles.arrowCircle : styles.arrow} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
}
export function Action({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  const cls = `${styles.action} ${light ? styles.actionLight : ''}`;
  return href.startsWith('#') || href.startsWith('mailto:') ? <a className={cls} href={href}>{children}<Arrow circle /></a> : <Link prefetch={false} className={cls} href={href}>{children}<Arrow circle /></Link>;
}
export function CinematicFooter() {
  return <footer className={`${styles.footer} ${footerStyles.footer}`} data-cinematic="footer"><div className={`wrap ${footerStyles.inner}`}>
    <div className={footerStyles.contact} data-footer-contact><div><h2>Get in touch.</h2></div><a href="mailto:founder@midnightstudios.app">founder@midnightstudios.app<Arrow circle /></a></div>
    <FooterSupport />
    <div className={styles.moonHorizon} aria-hidden="true" data-moon><div className={styles.moonCamera}><div className={styles.moonDrift} data-moon-drift><img className={styles.moonTexture} src="/assets/footer-moon.webp" width="2172" height="724" alt="" loading="lazy" decoding="async" /></div></div></div>
    <div className={footerStyles.signature} data-footer-brand><div className={footerStyles.logo}><BrandArt /></div><p className={footerStyles.name} translate="no">Midnight Studios</p><p className={footerStyles.slogan}>Imagination never sleeps</p></div>
    <div className={footerStyles.bottom}><span>© 2026 Midnight Studios</span><MoonMotionToggle className={styles.moonToggle} /></div>
  </div></footer>;
}
