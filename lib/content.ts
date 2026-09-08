import fs from 'node:fs';
import path from 'node:path';
export type PageData={slug:string;type:string;title:string;heading:string;description:string;seo:{title:string;description:string};sections?:{title:string;body:string}[];links?:{title:string;description:string;href:string}[];audience?:string[];audienceTitle?:string;sectionTitle?:string;deliverables?:string[];deliverablesTitle?:string;scopeNote?:string;faqs?:{question:string;answer:string}[];faqTitle?:string;cta?:string;emptyTitle?:string;emptyDescription?:string;priceLabel?:string;ui?:Record<string,string|string[]>;booking?:{title:string;duration:string;note:string;dateLabel:string;timeLabel:string;timezone:string;timezoneLabel:string;disabledLabel:string;fallback:string;selectedLabel:string;datePrompt:string;dayNames:string[];times:string[]}};
const root=path.join(process.cwd(),'data','pages');
function walk(dir:string):string[]{return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):entry.name.endsWith('.json')?[path.join(dir,entry.name)]:[])}
export function allPages():PageData[]{return walk(root).map(file=>JSON.parse(fs.readFileSync(file,'utf8')) as PageData)}
export function getPage(slug:string){return allPages().find(page=>page.slug===slug)}
