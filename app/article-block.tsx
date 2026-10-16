import type {ReactNode} from 'react';
import type {PostRecord} from '@/lib/content-schema';
import styles from './inner-page.module.css';
// Deliberately limited formatting: raw HTML is always escaped by React.
export function InlineText({text}:{text:string}){
 const nodes:ReactNode[]=[];const pattern=/\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
 let offset=0;
 for(const m of text.matchAll(pattern)){nodes.push(text.slice(offset,m.index));nodes.push(m[1]?<strong key={m.index}>{m[1]}</strong>:m[2]?<em key={m.index}>{m[2]}</em>:<a key={m.index} href={m[4]} rel="noopener noreferrer" target="_blank">{m[3]}</a>);offset=m.index!+m[0].length;}
 nodes.push(text.slice(offset));return <>{nodes}</>;
}
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
export function ArticleBlock({block,resolve=(s:string)=>s}:{block:PostRecord['body'][number];resolve?:(s:string)=>string}){
 switch(block.type){
  case 'heading':return <h2>{block.text}</h2>;
  case 'paragraph':return <p>{block.text}</p>;
  case 'richtext':return <p style={{whiteSpace:'pre-wrap'}}><InlineText text={block.text}/></p>;
  case 'note':return <p className={styles.articleNote}>{block.text}</p>;
  case 'quote':return <blockquote>{block.lines.map((line,n)=><span key={n}>{n===0?'“':null}{line}{n===block.lines.length-1?'”':null}</span>)}</blockquote>;
  case 'investment':return <div className={styles.investment}><p className={styles.label}>{block.label}</p><div><strong>{money(block.paid)}</strong><span>Already paid</span></div><div><strong>{money(block.committed)}</strong><span>Further committed development</span></div><div><strong>{money(block.paid+block.committed)}</strong><span>Projected total</span></div></div>;
  case 'image':return <figure><img src={resolve(block.image.src)} width={block.image.width} height={block.image.height} alt={block.image.alt} style={{maxWidth:'100%',height:'auto'}}/>{block.image.caption?<figcaption>{block.image.caption}</figcaption>:null}</figure>;
  case 'list':return block.ordered?<ol>{block.items.map((s,i)=><li key={i}><InlineText text={s}/></li>)}</ol>:<ul>{block.items.map((s,i)=><li key={i}><InlineText text={s}/></li>)}</ul>;
  case 'divider':return <hr/>;
 }
}
