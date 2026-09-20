'use strict';

// Post-build SEO audit of the generated files in dist/. Complements
// validate-data.js (which checks the JSON): this checks what was actually
// rendered, so a template change cannot silently break canonicals or schema.

const fs = require('fs');
const path = require('path');
const { isIndexable } = require('./generate-seo');

const URL_IN_TEXT = /https?:\/\/[^\s"'<>]+/g;

function metaContent(html, attr, name) {
  const re = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i');
  const match = html.match(re);
  return match ? match[1] : null;
}

function checkOutput({ outDir, site, pages, mode }) {
  const errors = [];
  const origin = site.productionDomain;

  for (const { data: page } of pages) {
    const isNotFound = page.type === 'not-found';
    const rel = isNotFound ? '404.html' : path.join(page.canonicalPath, 'index.html');
    const file = path.join(outDir, rel);
    const label = rel.split(path.sep).join('/').replace(/^\//, '');
    if (!fs.existsSync(file)) {
      errors.push(`${label}: expected output file was not generated`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');

    const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    const ogUrl = metaContent(html, 'property', 'og:url');
    const ogImage = metaContent(html, 'property', 'og:image');
    const robots = metaContent(html, 'name', 'robots');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];

    if (isNotFound) {
      if (canonical) errors.push(`${label}: the 404 page must not declare a canonical`);
    } else {
      const expected = origin + page.canonicalPath;
      if (canonical !== expected) errors.push(`${label}: canonical is "${canonical}", expected "${expected}"`);
      if (ogUrl !== expected) errors.push(`${label}: og:url is "${ogUrl}", expected "${expected}"`);
    }
    if (!ogImage || !ogImage.startsWith(origin + '/')) {
      errors.push(`${label}: og:image "${ogImage}" is not on the production domain`);
    }
    if (!title || !metaContent(html, 'name', 'description')) errors.push(`${label}: missing <title> or meta description`);
    if (!/<h1[\s>]/.test(html)) errors.push(`${label}: no <h1> rendered`);
    if (mode === 'production' && isIndexable(page) && robots && /noindex/i.test(robots)) {
      errors.push(`${label}: rendered robots meta is "${robots}" in production`);
    }

    // Every absolute URL inside structured data must be on the production domain.
    for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        JSON.parse(block[1]);
      } catch (err) {
        errors.push(`${label}: invalid JSON-LD (${err.message})`);
      }
      for (const url of block[1].match(URL_IN_TEXT) || []) {
        if (!url.startsWith(origin) && !/^https:\/\/schema\.org\/?$/.test(url)) errors.push(`${label}: schema URL "${url}" is not on the production domain`);
      }
    }
  }

  const sitemapPath = path.join(outDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    errors.push('sitemap.xml was not generated');
  } else {
    const locs = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
    const expected = new Set(pages.map((p) => p.data).filter(isIndexable).map((p) => origin + p.canonicalPath));
    for (const loc of locs) {
      if (!expected.has(loc)) errors.push(`sitemap.xml: unexpected URL "${loc}"`);
    }
    if (locs.length !== expected.size) errors.push(`sitemap.xml: has ${locs.length} URLs, expected ${expected.size}`);
  }

  const robotsPath = path.join(outDir, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    errors.push('robots.txt was not generated');
  } else {
    const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
    if (!robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`)) errors.push('robots.txt: missing production Sitemap line');
    if (/^\s*Disallow:\s*\/\s*$/im.test(robotsTxt)) errors.push('robots.txt: must not block the whole site');
  }

  return { errors };
}

module.exports = { checkOutput };
