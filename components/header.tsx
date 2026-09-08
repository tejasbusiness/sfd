'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,ChevronDown,ArrowUpRight,Monitor,MapPin,Workflow,Video,Megaphone,MessagesSquare,LayoutGrid,BookOpen,Sparkles,Image as ImageIcon,Receipt} from 'lucide-react';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import site from '@/data/site.json';
import navigation from '@/data/navigation.json';

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

  return <header className="site-header"><Brand/><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item=>{if(!item.children)return <a key={item.href} className={path===item.href?'active':''} href={item.href}>{item.label}</a>;
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
    </div>;})}</nav><a href="/book-a-call" className="header-cta">{site.bookLabel}<ArrowUpRight size={14}/></a><div className="mobile-nav"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger className="menu-button" aria-label={site.menuLabel}><Menu size={27}/></SheetTrigger><SheetContent className="mobile-sheet"><SheetTitle className="sr-only">{site.menuLabel}</SheetTitle><SheetDescription className="sr-only">Explore SynergyFirst Digital</SheetDescription><Brand/><nav aria-label="Mobile navigation">{navigation.map(item=><div key={item.label}>{item.children?<details><summary>{item.label}<ChevronDown size={16}/></summary><div>{item.label==='Free Tools'&&item.megaHeading&&<p className="mobile-mega-heading">{item.megaHeading}</p>}{item.children.map(child=><a href={child.href} onClick={()=>setOpen(false)} key={child.href}>{child.label}</a>)}{(item as {secondaryChildren?:{label:string;href:string}[]}).secondaryChildren?.map(child=><a href={child.href} onClick={()=>setOpen(false)} key={child.href}>{child.label}</a>)}{item.footerLink&&<a href={item.footerLink.href} onClick={()=>setOpen(false)} key={item.footerLink.href}>{item.footerLink.label}</a>}{item.label==='Free Tools'&&item.promo&&<a className="mobile-mega-promo" href={item.promo.href} onClick={()=>setOpen(false)}><span className="mobile-mega-promo-eyebrow">{item.promo.eyebrow}</span><span className="mobile-mega-promo-title">{item.promo.title}</span><span className="mobile-mega-promo-desc">{item.promo.description}</span><span className="mobile-mega-promo-cta">{item.promo.cta}<ArrowUpRight size={14}/></span></a>}</div></details>:<a href={item.href} onClick={()=>setOpen(false)}>{item.label}</a>}</div>)}<a className="primary-button" href="/book-a-call" onClick={()=>setOpen(false)}>{site.bookLabel}<ArrowUpRight size={16}/></a></nav></SheetContent></Sheet></div></header>;
}
