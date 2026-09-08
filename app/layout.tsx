import type { Metadata } from 'next';
import site from '@/data/site.json';
import home from '@/data/home.json';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ScrollLink from '@/components/scroll-link';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/jetbrains-mono/500.css';
import './pages.css';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(site.url),title:home.seo.title,description:home.seo.description,robots:{index:site.productionReady,follow:true},alternates:{canonical:'/'},openGraph:{type:'website',siteName:site.name,title:home.seo.title,description:home.seo.description,url:site.url},twitter:{card:'summary',title:home.seo.title,description:home.seo.description}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body><ScrollLink targetId="main" className="skip-link">{site.skipLabel}</ScrollLink><Header/>{children}<Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':`${site.url}/#organization`,name:site.name,url:site.url},{'@type':'WebSite','@id':`${site.url}/#website`,name:site.name,url:site.url,publisher:{'@id':`${site.url}/#organization`}}]}).replace(/</g,'\\u003c')}}/></body></html>}

