'use strict';

const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

function copyIfExists(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (fs.readdirSync(srcDir).length === 0) return;
  fs.cpSync(srcDir, destDir, { recursive: true });
}

function renderPages({ templatesDir, outDir, mode, sharedData, pages }) {
  const env = nunjucks.configure(templatesDir, {
    autoescape: true,
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true,
  });

  // Resolves a page's `itemIds` selection (e.g. an FAQ block) against a shared
  // collection's `id` field, in the order requested — used for content-block
  // "selection" per docs/05-data-architecture.md.
  env.addFilter('selectByIds', (items, ids) => {
    if (!Array.isArray(items) || !Array.isArray(ids)) return [];
    const byId = new Map(items.map((item) => [item.id, item]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  });

  const site = sharedData['site.json'];
  const company = sharedData['company.json'];
  const navigation = sharedData['navigation.json'];
  const footer = sharedData['footer.json'];
  const plans = sharedData['plans.json'] || { plans: [] };
  const faqs = sharedData['faqs.json'] || { items: [] };
  const testimonials = sharedData['testimonials.json'] || { items: [] };
  const projects = sharedData['projects.json'] || { items: [] };
  const countryCodes = sharedData['country-codes.json'] || { defaultIso2: '', countries: [] };
  const buildYear = new Date().getFullYear();

  const written = [];

  for (const { data: page } of pages) {
    const html = env.render('pages/page.njk', {
      site,
      company,
      navigation,
      footer,
      plans,
      faqs,
      testimonials,
      projects,
      countryCodes,
      page,
      mode,
      buildYear,
    });

    const outPath = path.join(outDir, page.canonicalPath, 'index.html');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
    written.push(path.relative(outDir, outPath));
  }

  return written;
}

module.exports = { renderPages, copyIfExists };
