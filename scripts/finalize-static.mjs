import fs from 'node:fs';
import path from 'node:path';
const site=JSON.parse(fs.readFileSync('data/site.json','utf8'));
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pages=walk('data/pages').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(f,'utf8'))).filter(p=>p.type!=='error');
const xmlEscape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const urls=site.productionReady?[site.url+'/',...pages.map(p=>site.url+'/'+p.slug)]:[];
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n')+'\n</urlset>\n';
const robots=`User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;
for(const dir of ['public','dist/client'])if(fs.existsSync(dir)){fs.writeFileSync(path.join(dir,'sitemap.xml'),sitemap);fs.writeFileSync(path.join(dir,'robots.txt'),robots)}
console.log('Static sitemap and crawler settings generated.');
