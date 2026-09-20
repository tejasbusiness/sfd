'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { loadJson, validatePage, validateCrossPage } = require('../scripts/validate-data');

const fixturesDir = path.join(__dirname, 'fixtures');

function loadFixture(name) {
  const file = path.join(fixturesDir, name);
  return { file, data: loadJson(file) };
}

test('a fully valid page passes with no errors', () => {
  const page = loadFixture('valid-page.json');
  const { errors } = validatePage(page, { mode: 'production' });
  assert.deepEqual(errors, []);
});

test('a page missing a required SEO field fails', () => {
  const page = loadFixture('missing-seo-field.json');
  const { errors } = validatePage(page, { mode: 'development' });
  assert.ok(errors.some((e) => e.includes('seo.metaDescription')));
});

test('a page with an invalid slug fails', () => {
  const page = loadFixture('invalid-slug.json');
  const { errors } = validatePage(page, { mode: 'development' });
  assert.ok(errors.some((e) => e.includes('invalid slug')));
});

test('two pages sharing a canonical path fail cross-page validation', () => {
  const a = loadFixture('duplicate-canonical-a.json');
  const b = loadFixture('duplicate-canonical-b.json');
  const { errors } = validateCrossPage([a, b]);
  assert.ok(errors.some((e) => e.includes('Duplicate canonicalPath')));
});

test('an unresolved TBD placeholder is a warning (not fatal) in development mode', () => {
  const page = loadFixture('unresolved-tbd.json');
  const { errors, warnings } = validatePage(page, { mode: 'development' });
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => w.includes('TBD')));
});

test('an unresolved TBD placeholder fails the build in production mode', () => {
  const page = loadFixture('unresolved-tbd.json');
  const { errors } = validatePage(page, { mode: 'production' });
  assert.ok(errors.some((e) => e.includes('TBD')));
});

const { validateSite, validateRedirects, validateSeoAcrossPages } = require('../scripts/validate-data');
const { buildSitemap, buildRobots, buildNginxConfig } = require('../scripts/generate-seo');

const seoPage = (canonicalPath, extra = {}) => ({
  file: `${canonicalPath}.json`,
  data: {
    type: 'static',
    canonicalPath,
    h1: `H1 ${canonicalPath}`,
    seo: { title: `T ${canonicalPath}`, metaDescription: `D ${canonicalPath}`, robots: 'index, follow', ogImage: '/og.jpg' },
    ...extra,
  },
});

test('production domain must be a bare https origin on a non-temporary host', () => {
  assert.deepEqual(validateSite({ productionDomain: 'https://synergyfirstdigital.com' }).errors, []);
  for (const bad of ['http://synergyfirstdigital.com', 'https://synergyfirstdigital.com/', 'https://x.pages.dev', 'https://localhost', 'https://192.168.0.1', 'https://staging.synergyfirstdigital.com']) {
    assert.ok(validateSite({ productionDomain: bad }).errors.length > 0, bad);
  }
});

test('duplicate titles and invalid robots values fail; a missing og image is fatal only in production', () => {
  const pages = [seoPage('/a/'), seoPage('/b/', { seo: { title: 'T /a/', metaDescription: 'D b', robots: 'sometimes', ogImage: '/og.jpg' } })];
  const { errors } = validateSeoAcrossPages(pages, { mode: 'development' });
  assert.ok(errors.some((e) => e.includes('Duplicate seo.title')));
  assert.ok(errors.some((e) => e.includes('invalid seo.robots')));

  const missing = validateSeoAcrossPages([seoPage('/a/')], { mode: 'production', rootDir: __dirname });
  assert.equal(missing.errors.length, 1);
  assert.equal(validateSeoAcrossPages([seoPage('/a/')], { mode: 'development', rootDir: __dirname }).errors.length, 0);
});

test('redirects must be single-hop to live pages and never shadow a live page', () => {
  const pages = [seoPage('/new/'), seoPage('/other/')];
  assert.deepEqual(validateRedirects([{ from: '/old/', to: '/new/' }], pages).errors, []);
  assert.ok(validateRedirects([{ from: '/old/', to: '/gone/' }], pages).errors.length > 0);
  assert.ok(validateRedirects([{ from: '/other/', to: '/new/' }], pages).errors.length > 0);
  assert.ok(validateRedirects([{ from: '/old/', to: '/new/' }, { from: '/old/', to: '/new/' }], pages).errors.length > 0);
});

test('sitemap lists only indexable pages on the production domain; robots points to it', () => {
  const site = { productionDomain: 'https://example-prod.com' };
  const pages = [seoPage('/a/'), seoPage('/404/', { type: 'not-found' }), seoPage('/d/', { type: 'internal-diagnostic' }), seoPage('/n/', { seo: { robots: 'noindex' } })];
  const xml = buildSitemap({ site, pages });
  assert.ok(xml.includes('<loc>https://example-prod.com/a/</loc>'));
  assert.equal((xml.match(/<loc>/g) || []).length, 1);
  assert.ok(buildRobots({ site }).includes('Sitemap: https://example-prod.com/sitemap.xml'));
  assert.ok(buildNginxConfig({ redirects: [{ from: '/old/', to: '/new/' }] }).includes('location = /old { return 301 /new/; }'));
});
