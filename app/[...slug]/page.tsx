import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {allPages,getPage} from '@/lib/content';
import site from '@/data/site.json';
import {ArrowUpRight,Check} from 'lucide-react';
import FAQ from '@/components/faq';
import Booking from '@/components/booking';
import Tools from '@/components/tools';
export function generateStaticParams(){return allPages().filter(p=>p.type!=='error').map(p=>({slug:p.slug.split('/')}))}
export const dynamicParams=false;
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{const {slug}=await params;const p=getPage(slug.join('/'));if(!p)return {};return {title:p.seo.title,description:p.seo.description,alternates:{canonical:`/${p.slug}`},openGraph:{type:'website',title:p.seo.title,description:p.seo.description,url:`${site.url}/${p.slug}`,siteName:site.name},twitter:{card:'summary',title:p.seo.title,description:p.seo.description}}}
export default async function ContentPage({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const p=getPage(slug.join('/'));if(!p)notFound();const ui=p.ui as Record<string,string>;const parents=slug.slice(0,-1).map((part,i)=>({name:part.replaceAll('-',' '),slug:slug.slice(0,i+1).join('/')})).filter(p=>getPage(p.slug));const breadcrumbs=[{name:'Home',url:site.url+'/'},...parents.map(p=>({name:p.name,url:site.url+'/'+p.slug})),{name:p.title,url:site.url+'/'+p.slug}];return <main id="main" className="inner-page"><div className="page-hero container"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>{p.title}</span></nav><p className="eyebrow">{p.title}</p><h1>{p.heading}</h1><p>{p.description}</p>{p.type==='service'&&<a className="primary-button" href="/book-a-call">{p.cta}<ArrowUpRight size={17}/></a>}</div>
{p.audience&&<section className="container section audience-section"><h2>{p.audienceTitle}</h2><ul>{p.audience.map(a=><li key={a}><Check size={18}/>{a}</li>)}</ul></section>}
{p.links&&<section className="container section page-link-grid">{p.links.map(l=><a className="service-card" href={l.href} key={l.href}><h2>{l.title}</h2><p>{l.description}</p><span className="text-link">{p.type==='pricing'?p.priceLabel:'Explore'}<ArrowUpRight size={16}/></span></a>)}</section>}
{p.deliverables&&<section className="container section deliverables"><h2>{p.deliverablesTitle}</h2><div>{p.deliverables.map(d=><p key={d}><Check size={17}/>{d}</p>)}</div><p>{p.scopeNote}</p></section>}
{p.sections&&<section className="container section content-sections">{p.sectionTitle&&<h2>{p.sectionTitle}</h2>}{p.sections.map((s,i)=><article key={s.title}><span className="section-index">0{i+1}</span><h2>{s.title}</h2><p>{s.body}</p></article>)}</section>}
{p.type==='work'&&<section className="container empty-work"><h2>{p.emptyTitle}</h2><p>{p.emptyDescription}</p><a className="primary-button" href="/book-a-call">{p.cta}<ArrowUpRight size={17}/></a></section>}
{p.booking&&<section className="container section"><Booking data={p.booking}/></section>}
{ui&&<section className="container tool-section"><Tools type={p.type} ui={ui}/></section>}
{p.type==='contact'&&<section className="container contact-options">{site.email&&<a className="primary-button" href={`mailto:${site.email}`}>{site.email}</a>}{site.phone&&<a className="secondary-button" href={`https://wa.me/${site.phone.replace(/\D/g,'')}`}>WhatsApp</a>}<a className="primary-button" href="/book-a-call">{site.bookLabel}<ArrowUpRight size={17}/></a>{!site.email&&!site.phone&&<p className="notice">Business contact details are not connected in this preview.</p>}</section>}
{p.faqs&&<section className="container section narrow"><h2>{p.faqTitle}</h2><FAQ items={p.faqs}/></section>}
{p.cta&&!['contact','work','booking'].includes(p.type)&&<section className="closing-section container"><a className="primary-button" href="/book-a-call">{p.cta}<ArrowUpRight size={17}/></a></section>}
<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'BreadcrumbList',itemListElement:breadcrumbs.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:b.url}))},...(p.type==='service'?[{'@type':'Service',name:p.title,description:p.description,url:site.url+'/'+p.slug,provider:{'@id':site.url+'/#organization'}}]:[])]}).replace(/</g,'\\u003c')}}/></main>}

