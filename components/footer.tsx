import type { CSSProperties } from 'react';
import { ArrowUp } from 'lucide-react';
import site from '@/data/site.json';
import navigation from '@/data/navigation.json';
import { InstagramIcon, FacebookIcon, XIcon, LinkedinIcon, YoutubeIcon } from '@/components/social-icons';
import ScrollLink from '@/components/scroll-link';
const socialLinks = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon, color: '#E1306C' },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, color: '#1877F2' },
  { key: 'twitter', label: 'X', Icon: XIcon, color: '#E7E9EA' },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon, color: '#0A66C2' },
  { key: 'youtube', label: 'YouTube', Icon: YoutubeIcon, color: '#FF0000' },
] as const;
export default function Footer(){return <footer className="site-footer"><p className="footer-word" aria-hidden="true">{site.shortName}</p><div className="container"><div className="footer-top"><p>{site.footerHeading}</p><a href="/book-a-call">{site.bookLabel} ↗</a></div><div className="footer-columns"><div><svg className="footer-logo" viewBox="0 0 32 36" aria-hidden="true"><path d="M7 1h24L19 13H8L1 20V7zM25 35H1l12-12h11l7-7v13z" fill="currentColor"/></svg><strong>{site.name}</strong><p>{site.tagline}</p><div className="footer-social">{socialLinks.map(s=>{const href=(site.social as Record<string,string>)[s.key];return <a key={s.key} href={href||'#'} aria-label={s.label} target={href?'_blank':undefined} rel={href?'noopener noreferrer':undefined} style={{'--social-color':s.color} as CSSProperties}><s.Icon size={17}/></a>})}</div></div><div><h2>{site.footerLinksLabel}</h2>{navigation.filter(i=>!i.children).map(i=><a href={i.href} key={i.href}>{i.label}</a>)}<a href="/our-work/portfolio">Portfolio</a><a href="/our-work/case-studies">Case Studies</a></div><div><h2>{site.serviceLinksLabel}</h2>{navigation[2].children?.map(i=><a href={i.href} key={i.href}>{i.label}</a>)}{navigation[2].secondaryChildren?.map(i=><a href={i.href} key={i.href}>{i.label}</a>)}{navigation[2].footerLink&&<a href={navigation[2].footerLink.href}>{navigation[2].footerLink.label}</a>}</div><div><h2>{site.toolsLinksLabel}</h2>{navigation[4].children?.map(i=><a href={i.href} key={i.href}>{i.label}</a>)}{navigation[4].footerLink&&<a href={navigation[4].footerLink.href}>{navigation[4].footerLink.label}</a>}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {site.copyright}</span><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refund-policy">Refund Policy</a><a href="/sitemap.xml">Sitemap</a></div><ScrollLink targetId="main" className="back-to-top" ariaLabel="Back to top"><ArrowUp size={16}/></ScrollLink></div></div></footer>}
