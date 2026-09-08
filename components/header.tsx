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

  return <header className="site-header"><Brand/><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item=>item.children?
    <div className="nav-item-mega" key={item.label} onMouseEnter={()=>openNow(item.label)} onMouseLeave={closeSoon} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpenMega(null);}}>
      <button type="button" className="nav-button" aria-haspopup="true" aria-expanded={openMega===item.label} onClick={()=>openNow(item.label)}>{item.label}<ChevronDown size={12}/></button>
      <div className={openMega===item.label?'mega-panel is-open':'mega-panel'}>
        <div className="mega-body">
          {item.megaHeading&&<p className="mega-heading">{item.megaHeading}</p>}
          <div className="mega-items" style={{gridTemplateColumns:`repeat(${item.children.length===3?3:2},1fr)`}}>{item.children.map(child=>{const Icon=child.icon?megaIcons[child.icon]:undefined;return <a href={child.href} className="mega-item" key={child.href} onClick={()=>setOpenMega(null)}>
            <span className="mega-item-icon">{Icon&&<Icon size={18} strokeWidth={1.6}/>}</span>
            <span className="mega-item-text"><span className="mega-item-title">{child.label}</span>{child.description&&<span className="mega-item-desc">{child.description}</span>}</span>
          </a>})}</div>
          {item.footerLink&&<a className="mega-footer-link" href={item.footerLink.href} onClick={()=>setOpenMega(null)}>{item.footerLink.label}<ArrowUpRight size={14}/></a>}
        </div>
        {item.promo&&<div className="mega-promo">
          <p className="mega-promo-eyebrow">{item.promo.eyebrow}</p>
          <p className="mega-promo-title">{item.promo.title}</p>
          <p className="mega-promo-desc">{item.promo.description}</p>
          <a className="primary-button" href={item.promo.href} onClick={()=>setOpenMega(null)}>{item.promo.cta}<ArrowUpRight size={16}/></a>
        </div>}
      </div>
    </div>
    :<a key={item.href} className={path===item.href?'active':''} href={item.href}>{item.label}</a>)}</nav><a href="/book-a-call" className="header-cta">{site.bookLabel}<ArrowUpRight size={14}/></a><div className="mobile-nav"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger className="menu-button" aria-label={site.menuLabel}><Menu size={27}/></SheetTrigger><SheetContent className="mobile-sheet"><SheetTitle className="sr-only">{site.menuLabel}</SheetTitle><SheetDescription className="sr-only">Explore SynergyFirst Digital</SheetDescription><Brand/><nav aria-label="Mobile navigation">{navigation.map(item=><div key={item.label}>{item.children?<details><summary>{item.label}<ChevronDown size={16}/></summary><div>{item.children.map(child=><a href={child.href} onClick={()=>setOpen(false)} key={child.href}>{child.label}</a>)}{item.footerLink&&<a href={item.footerLink.href} onClick={()=>setOpen(false)} key={item.footerLink.href}>{item.footerLink.label}</a>}</div></details>:<a href={item.href} onClick={()=>setOpen(false)}>{item.label}</a>}</div>)}<a className="primary-button" href="/book-a-call" onClick={()=>setOpen(false)}>{site.bookLabel}<ArrowUpRight size={16}/></a></nav></SheetContent></Sheet></div></header>;
}
