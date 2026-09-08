'use client';
import {Fragment,useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,ChevronDown,ArrowUpRight,Home,Calendar,Users,Tag,Mail,Monitor,MapPin,Workflow,Video,Megaphone,MessagesSquare,LayoutGrid,BookOpen,Sparkles,Image as ImageIcon,Receipt} from 'lucide-react';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {InstagramIcon,FacebookIcon,XIcon,LinkedinIcon,YoutubeIcon} from '@/components/social-icons';
import site from '@/data/site.json';
import navigation from '@/data/navigation.json';

const socialLinks=[
  {key:'instagram',label:'Instagram',Icon:InstagramIcon,color:'#E1306C'},
  {key:'facebook',label:'Facebook',Icon:FacebookIcon,color:'#1877F2'},
  {key:'twitter',label:'X',Icon:XIcon,color:'#18181B'},
  {key:'linkedin',label:'LinkedIn',Icon:LinkedinIcon,color:'#0A66C2'},
  {key:'youtube',label:'YouTube',Icon:YoutubeIcon,color:'#FF0000'},
] as const;

const megaIcons:Record<string,typeof Monitor> = {
  monitor:Monitor,
  'map-pin':MapPin,
  workflow:Workflow,
  video:Video,
  megaphone:Megaphone,
  'messages-square':MessagesSquare,
  'layout-grid':LayoutGrid,
  'book-open':BookOpen,
  sparkles:Sparkles,
  image:ImageIcon,
  receipt:Receipt,
};

const drawerLinks=[
  {label:'About Us',href:'/about',icon:Users},
  {label:'Portfolio',href:'/our-work/portfolio',icon:LayoutGrid},
  {label:'Case Studies',href:'/our-work/case-studies',icon:BookOpen},
  {label:'Pricing',href:'/pricing',icon:Tag},
  {label:'Contact Us',href:'/contact',icon:Mail},
];

export function Brand(){return <a className="brand" href="/" aria-label={site.name}><svg viewBox="0 0 32 36" width="26" height="30" aria-hidden="true"><path d="M7 1h24L19 13H8L1 20V7zM25 35H1l12-12h11l7-7v13z" fill="currentColor"/></svg><span>{site.shortName}</span></a>}

export default function Header(){
  const [open,setOpen]=useState(false);
  const [openMega,setOpenMega]=useState<string|null>(null);
  const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const path=usePathname();

  function openNow(label:string){if(closeTimer.current)clearTimeout(closeTimer.current);setOpenMega(label);}
  function closeSoon(){if(closeTimer.current)clearTimeout(closeTimer.current);closeTimer.current=setTimeout(()=>setOpenMega(null),150);}

  useEffect(()=>{
    if(!openMega)return;
    function onKey(e:KeyboardEvent){if(e.key==='Escape')setOpenMega(null);}
    document.addEventListener('keydown',onKey);
    return ()=>document.removeEventListener('keydown',onKey);
  },[openMega]);

  return <Fragment><header className="site-header"><Brand/><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item=>{if(!item.children)return <a key={item.href} className={path===item.href?'active':''} href={item.href}>{item.label}</a>;
    const megaSlug=item.label.toLowerCase().replace(/\s+/g,'-');
    const isServices=item.label==='Services';
    return <div className={`nav-item-mega nav-item-mega--${megaSlug}`} key={item.label} onMouseEnter={()=>openNow(item.label)} onMouseLeave={closeSoon} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpenMega(null);}}>
      <button type="button" className="nav-button" aria-haspopup="true" aria-expanded={openMega===item.label} onClick={()=>openNow(item.label)}>{item.label}<ChevronDown size={12}/></button>
      <div className={`mega-panel mega-panel--${megaSlug}${openMega===item.label?' is-open':''}`}>
        <div className="mega-body">
          {item.megaHeading&&<p className="mega-heading">{item.megaHeading}</p>}
          <div className="mega-items" style={{gridTemplateColumns:`repeat(${item.children.length===4?2:item.children.length===3?1:2},1fr)`}}>{item.children.map(child=>{const Icon=child.icon?megaIcons[child.icon]:undefined;const category=(child as {category?:string}).category;const action=(child as {action?:string}).action;return <a href={child.href} className="mega-item" key={child.href} onClick={()=>setOpenMega(null)}>
            <span className="mega-item-icon">{Icon&&<Icon size={18} strokeWidth={1.6}/>}</span>
            <span className="mega-item-text">{category&&<span className="mega-item-category">{category}</span>}<span className="mega-item-title">{child.label}</span>{child.description&&<span className="mega-item-desc">{child.description}</span>}{action&&<span className="mega-item-action">{action}<ArrowUpRight size={12}/></span>}</span>
            {isServices&&<ArrowUpRight className="mega-item-arrow" size={14}/>}
          </a>})}</div>
          {(item as {secondaryChildren?:{label:string;href:string}[]}).secondaryChildren&&<div className="mega-secondary">
            {(item as {secondaryLabel?:string}).secondaryLabel&&<p className="mega-secondary-label">{(item as {secondaryLabel?:string}).secondaryLabel}</p>}
            <div className="mega-secondary-list">{(item as {secondaryChildren:{label:string;href:string}[]}).secondaryChildren.map(child=><a href={child.href} className="mega-secondary-item" key={child.href} onClick={()=>setOpenMega(null)}>{child.label}<ArrowUpRight size={12}/></a>)}</div>
          </div>}
          {item.footerLink&&<a className="mega-footer-link" href={item.footerLink.href} onClick={()=>setOpenMega(null)}>{item.footerLink.label}<ArrowUpRight size={14}/></a>}
        </div>
        {item.promo&&<div className="mega-promo">
          <p className="mega-promo-eyebrow">{item.promo.eyebrow}</p>
          <p className="mega-promo-title">{item.promo.title}</p>
          <p className="mega-promo-desc">{item.promo.description}</p>
          <a className="primary-button" href={item.promo.href} onClick={()=>setOpenMega(null)}>{item.promo.cta}<ArrowUpRight size={16}/></a>
        </div>}
      </div>
    </div>;})}</nav><a href="/book-a-call" className="header-cta">{site.bookLabel}<ArrowUpRight size={14}/></a></header><Sheet open={open} onOpenChange={setOpen}><nav className="bottom-nav-bar" aria-label="Mobile bottom navigation"><a href="/" className={path==='/'?'bottom-nav-item active':'bottom-nav-item'}><Home size={20}/><span>Home</span></a><a href="/services" className={path==='/services'||path?.startsWith('/services/')?'bottom-nav-item active':'bottom-nav-item'}><LayoutGrid size={20}/><span>Services</span></a><a href="/book-a-call" className="bottom-nav-cta" aria-label={site.bookLabel}><Calendar size={20}/></a><a href="/free-tools" className={path==='/free-tools'||path?.startsWith('/free-tools/')?'bottom-nav-item active':'bottom-nav-item'}><Sparkles size={20}/><span>Tools</span></a><SheetTrigger className={open?'bottom-nav-item bottom-nav-menu is-open':'bottom-nav-item bottom-nav-menu'} aria-label={site.menuLabel}><Menu size={20}/><span>Menu</span></SheetTrigger></nav><SheetContent className="mobile-sheet" side="right"><SheetTitle className="sr-only">{site.menuLabel}</SheetTitle><SheetDescription className="sr-only">Explore SynergyFirst Digital</SheetDescription><Brand/><nav className="mobile-drawer-grid" aria-label="Mobile navigation">{drawerLinks.map(item=>{const Icon=item.icon;return <a href={item.href} className="mobile-drawer-item" onClick={()=>setOpen(false)} key={item.href}><Icon size={24} strokeWidth={1.6}/><span>{item.label}</span></a>;})}</nav><div className="mobile-drawer-divider"/><div className="mobile-drawer-social">{socialLinks.map(s=>{const href=(site.social as Record<string,string>)[s.key];return <a key={s.key} href={href||'#'} aria-label={s.label} target={href?'_blank':undefined} rel={href?'noopener noreferrer':undefined} style={{'--social-color':s.color} as CSSProperties}><s.Icon size={17}/></a>;})}</div></SheetContent></Sheet></Fragment>;
}
