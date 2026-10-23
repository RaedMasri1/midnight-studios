import styles from './footer.module.css';

export function FooterSupport({className}:{className?:string}) {
  return <section className={className?`${styles.support} ${className}`:styles.support} aria-labelledby="footer-support-heading">
    <div className={styles.supportCopy}><h2 id="footer-support-heading">Help us create what comes next</h2><p>Enjoy what we’re building? Support Midnight Studios and be part of the journey.</p></div>
    <a className={styles.supportLink} href="https://ko-fi.com/midnightstudiosgames" target="_blank" rel="noopener noreferrer" aria-label="Support on Ko-fi (opens in a new tab)">
      <svg className={styles.supportHeart} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
      <span>Support on Ko-fi</span>
      <svg className={styles.supportArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 17 10-10M7 7h10v10" /></svg>
    </a>
  </section>;
}
