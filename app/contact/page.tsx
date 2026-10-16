import { pageMetadata, BreadcrumbData } from '../seo';
import { StudioPage, TextLink } from '../inner-page';
import { Action } from '../cinematic-ui';
import styles from '../inner-page.module.css';
import opening from '../page-openings.module.css';

export const metadata = pageMetadata({ title: 'Contact Our Doha Game Studio | Midnight Studios', description: 'Contact Midnight Studios, an independent mobile game studio in Doha, Qatar, for questions about Just Jump!, Dreamward, and the studio.', path: '/contact' });
export default function Contact() {
  return <StudioPage active="contact"><BreadcrumbData items={[["Home", "/"], ["Contact", "/contact"]]} />
    <section className={opening.contact} aria-labelledby="contact-heading"><div className={`wrap ${opening.contactLayout}`}>
      <div className={opening.contactCopy} data-page-reveal><h1 id="contact-heading">Get in touch.</h1><p>Questions about our games or an idea to share? We’d love to hear from you.</p><div className={opening.contactActions}><Action href="mailto:founder@midnightstudios.app" light>Email the studio</Action><a href="mailto:founder@midnightstudios.app">founder@midnightstudios.app</a></div></div>
      <div className={opening.mailArt} aria-hidden="true" data-mail-art data-page-reveal data-page-delay="100"><div className={opening.mailOrbit} data-mail-motion /><div className={opening.letter} data-mail-motion><svg viewBox="0 0 240 180" fill="none"><g className={opening.mailNote} data-mail-motion><rect x="47" y="28" width="146" height="106" rx="8" fill="#15151c" /><path d="M70 48h100M70 64h72" opacity=".6" /></g><path d="M17 42a17 17 0 0 1 17-17h172a17 17 0 0 1 17 17v98a17 17 0 0 1-17 17H34a17 17 0 0 1-17-17Z" fill="#101015" /><path d="m23 148 67-54m127 54-67-54" /><path className={opening.mailFlap} data-mail-motion d="m24 35 83 63a22 22 0 0 0 26 0l83-63" /></svg><span>Say hello.</span></div></div>
    </div></section>
    <section id="write" className={`${styles.section} ${styles.light}`} data-theme="light"><div className={`wrap ${styles.contactDetails}`}><div data-page-reveal><h2>Built in Doha.</h2><p>Independent mobile games, from the first idea to the finished details.</p><TextLink href="/about">Meet Midnight Studios</TextLink></div><div data-page-reveal data-page-delay="90"><h2>Inside the studio.</h2><p>Follow the development stories behind our games.</p><TextLink href="/devlog">Read the journal</TextLink></div></div></section>
  </StudioPage>;
}
