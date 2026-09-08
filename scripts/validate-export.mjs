import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist/client');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root).filter(f=>f.endsWith('.html'));const titles=new Set();const errors=[];
function exists(url){const name=decodeURIComponent(url.split(/[?#]/)[0]);if(!name)return true;const resolved=path.join(root,name);return fs.existsSync(resolved)||fs.existsSync(resolved+'.html')||fs.existsSync(path.join(resolved,'index.html'))}
for(const file of files){const html=fs.readFileSync(file,'utf8');const name=path.relative(root,file);if((html.match(/<h1[\s>]/g)||[]).length!==1)errors.push(name+': expected one h1');const title=html.match(/<title>(.*?)<\/title>/)?.[1];if(!title)errors.push(name+': missing title');if(!name.includes('404')&&titles.has(title))errors.push(name+': duplicate title');if(!name.includes('404'))titles.add(title);if(!html.includes('name="description"'))errors.push(name+': missing description');if(!name.includes('404')&&!html.includes('rel="canonical"'))errors.push(name+': missing canonical');for(const match of html.matchAll(/(?:href|src)="(\/[^" ]*)"/g)){if(!exists(match[1]))errors.push(name+': broken local URL '+match[1])}for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))try{JSON.parse(match[1])}catch{errors.push(name+': invalid JSON-LD')};if(/Untitled site|Your site is taking shape|Building your site/.test(html))errors.push(name+': starter content remains')}
assert.ok(fs.existsSync(path.join(root,'robots.txt')));assert.ok(fs.existsSync(path.join(root,'sitemap.xml')));assert.ok(fs.existsSync(path.join(root,'404.html')));assert.deepEqual(errors,[]);console.log(`Verified ${files.length} static pages: headings, metadata, links, assets, structured data and 404.`);

