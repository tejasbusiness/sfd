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
