import { StudioPage, PortalArt } from './inner-page';
import { Action } from './cinematic-ui';
import styles from './inner-page.module.css';

export default function NotFound() {
  return <StudioPage active=""><section className={`${styles.hero} ${styles.notFound}`}><PortalArt defer /><div className="wrap"><div className={styles.heroContent} data-page-reveal><p className={styles.label}>404</p><h1>Page not found.</h1><p>This page could not be found. Our games are still right here.</p><div style={{ marginTop: 28 }}><Action href="/games" light>Explore our games</Action></div></div></div></section></StudioPage>;
}
