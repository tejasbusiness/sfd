import {getPage} from '@/lib/content';
export default function NotFound(){const p=getPage('not-found')!;return <main id="main" className="inner-page"><div className="page-hero container"><p className="eyebrow">404</p><h1>{p.heading}</h1><p>{p.description}</p><a className="primary-button" href="/">{p.cta}</a></div></main>}
