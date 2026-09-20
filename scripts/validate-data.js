'use strict';

const fs = require('fs');
const path = require('path');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CANONICAL_PATTERN = /^\/(?:[a-z0-9-]+\/)*$/;
const TBD_PATTERN = /\bTBD\b/i;

const REQUIRED_PAGE_FIELDS = ['id', 'type', 'slug', 'canonicalPath', 'seo', 'h1', 'sections', 'schemaTypes'];
const REQUIRED_SEO_FIELDS = ['title', 'metaDescription', 'ogTitle', 'ogDescription', 'ogImage', 'robots'];
const REQUIRED_SHARED_FILES = ['site.json', 'company.json', 'navigation.json', 'footer.json', 'theme.json'];
// Loaded and TBD-scanned when present, but a build doesn't need every page type
// (e.g. the build-check diagnostic page needs none of these), so they're optional.
const OPTIONAL_SHARED_FILES = ['plans.json', 'faqs.json', 'testimonials.json', 'projects.json', 'country-codes.json'];

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${err.message}`);
  }
}

function loadPageFiles(pagesDir) {
  if (!fs.existsSync(pagesDir)) return [];
  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      file: path.join(pagesDir, file),
      data: loadJson(path.join(pagesDir, file)),
    }));
}

/** Recursively collects dotted paths of every string value matching a whole-word "TBD". */
function findTbdPaths(value, currentPath = []) {
  const found = [];
  if (typeof value === 'string') {
    if (TBD_PATTERN.test(value)) found.push(currentPath.join('.') || '(root)');
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => found.push(...findTbdPaths(item, [...currentPath, i])));
  } else if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('_')) continue; // internal scaffold notes are not public content
      found.push(...findTbdPaths(value[key], [...currentPath, key]));
    }
  }
  return found;
}

/** Recursively collects dotted paths of every object carrying `verified: false`
 *  (docs/13-visual-art-direction.md §9) — a structured counterpart to the TBD
 *  string scanner, for non-string placeholders like unresolved prices. */
function findUnverifiedPaths(value, currentPath = []) {
  const found = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => found.push(...findUnverifiedPaths(item, [...currentPath, i])));
  } else if (value && typeof value === 'object') {
    if (value.verified === false) {
      found.push(currentPath.join('.') || '(root)');
    }
    for (const key of Object.keys(value)) {
      if (key.startsWith('_') || key === 'verified') continue;
      found.push(...findUnverifiedPaths(value[key], [...currentPath, key]));
    }
  }
  return found;
}

function validatePage({ file, data }, { mode }) {
  const errors = [];
  const warnings = [];
  const label = path.basename(file);

  for (const field of REQUIRED_PAGE_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`${label}: missing required field "${field}"`);
    }
  }

  if (data.seo) {
    for (const field of REQUIRED_SEO_FIELDS) {
      if (!data.seo[field]) {
        errors.push(`${label}: missing required SEO field "seo.${field}"`);
      }
    }
  }

  if (data.slug && !SLUG_PATTERN.test(data.slug)) {
    errors.push(`${label}: invalid slug "${data.slug}" (lowercase letters, numbers and single hyphens only)`);
  }

  if (data.canonicalPath && !CANONICAL_PATTERN.test(data.canonicalPath)) {
    errors.push(
      `${label}: invalid canonicalPath "${data.canonicalPath}" (must start and end with "/", lowercase hyphenated segments only)`
    );
  }

  if (Array.isArray(data.sections) && data.sections.length === 0) {
    errors.push(`${label}: "sections" must contain at least one section`);
  }

  if (Array.isArray(data.schemaTypes) && data.schemaTypes.length === 0) {
    errors.push(`${label}: "schemaTypes" must contain at least one schema type`);
  }

  // CLAUDE.md rule 8: production pages must never be noindex. The "internal-diagnostic"
  // page type is a deliberate, narrow exception for build-proof pages that must be
  // removed before real launch — flagged in docs/11 and the Phase 1 report, not silent.
  if (
    mode === 'production' &&
    data.type !== 'internal-diagnostic' &&
    data.seo &&
    typeof data.seo.robots === 'string' &&
    /noindex/i.test(data.seo.robots)
  ) {
    errors.push(`${label}: production pages must not use "noindex" (CLAUDE.md rule 8)`);
  }

  const tbdPaths = findTbdPaths(data);
  if (tbdPaths.length > 0) {
    const message = `${label}: unresolved TBD placeholder(s) at ${tbdPaths.join(', ')}`;
    if (mode === 'production') {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  const unverifiedPaths = findUnverifiedPaths(data);
  if (unverifiedPaths.length > 0) {
    const message = `${label}: unresolved "verified: false" item(s) at ${unverifiedPaths.join(', ')}`;
    if (mode === 'production') {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  return { errors, warnings };
}

function validateSharedFile(name, data, { mode }) {
  const errors = [];
  const warnings = [];
  const tbdPaths = findTbdPaths(data);
  if (tbdPaths.length > 0) {
    const message = `${name}: unresolved TBD placeholder(s) at ${tbdPaths.join(', ')}`;
    if (mode === 'production') {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }
  const unverifiedPaths = findUnverifiedPaths(data);
  if (unverifiedPaths.length > 0) {
    const message = `${name}: unresolved "verified: false" item(s) at ${unverifiedPaths.join(', ')}`;
    if (mode === 'production') {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }
  return { errors, warnings };
}

function validateCrossPage(pages) {
  const errors = [];
  const byCanonical = new Map();

  for (const { file, data } of pages) {
    if (!data.canonicalPath) continue;
    const existing = byCanonical.get(data.canonicalPath) || [];
    existing.push(path.basename(file));
    byCanonical.set(data.canonicalPath, existing);
  }

  for (const [canonicalPath, files] of byCanonical) {
    if (files.length > 1) {
      errors.push(`Duplicate canonicalPath "${canonicalPath}" used by: ${files.join(', ')}`);
    }
  }

  return { errors };
}

function validateNavigation(navigation, pages) {
  const errors = [];
  const knownPaths = new Set(pages.map((p) => p.data.canonicalPath).filter(Boolean));

  function checkItems(items) {
    for (const item of items || []) {
      if (item.path && !knownPaths.has(item.path) && !/^https?:\/\//.test(item.path)) {
        errors.push(`Navigation item "${item.label}" points to unresolved path "${item.path}"`);
      }
      if (item.children) checkItems(item.children);
    }
  }

  checkItems(navigation && navigation.primary);
  checkItems(navigation && navigation.primaryLeft);
  checkItems(navigation && navigation.primaryRight);
  checkItems(navigation && navigation.tabBar);
  checkItems(navigation && navigation.more);

  return { errors };
}

function validateFooter(footer, pages) {
  const errors = [];
  const knownPaths = new Set(pages.map((p) => p.data.canonicalPath).filter(Boolean));
  const groups = (footer && footer.groups) || [];
  for (const group of groups) {
    for (const link of group.links || []) {
      // link.path === null is deliberate (docs/13 §8.13): renders as a plain
      // label, not a broken link, until that page exists. Only a *non-null*
      // path must resolve to a real page.
      if (link.path && !knownPaths.has(link.path) && !/^https?:\/\//.test(link.path)) {
        errors.push(`Footer link "${link.label}" points to unresolved path "${link.path}"`);
      }
    }
  }
  return { errors };
}

function validateAll({ dataDir, mode }) {
  const errors = [];
  const warnings = [];
  const sharedData = {};

  for (const name of REQUIRED_SHARED_FILES) {
    const filePath = path.join(dataDir, name);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required shared data file: ${name}`);
      continue;
    }
    const data = loadJson(filePath);
    sharedData[name] = data;
    const result = validateSharedFile(name, data, { mode });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  for (const name of OPTIONAL_SHARED_FILES) {
    const filePath = path.join(dataDir, name);
    if (!fs.existsSync(filePath)) continue;
    const data = loadJson(filePath);
    sharedData[name] = data;
    const result = validateSharedFile(name, data, { mode });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  const pages = loadPageFiles(path.join(dataDir, 'pages'));
  if (pages.length === 0) {
    errors.push('No page data files found in data/pages/');
  }

  for (const page of pages) {
    const result = validatePage(page, { mode });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  errors.push(...validateCrossPage(pages).errors);

  if (sharedData['navigation.json']) {
    errors.push(...validateNavigation(sharedData['navigation.json'], pages).errors);
  }

  if (sharedData['footer.json']) {
    errors.push(...validateFooter(sharedData['footer.json'], pages).errors);
  }

  return { errors, warnings, pages, sharedData };
}

module.exports = {
  loadJson,
  loadPageFiles,
  findTbdPaths,
  findUnverifiedPaths,
  validatePage,
  validateSharedFile,
  validateCrossPage,
  validateNavigation,
  validateFooter,
  validateAll,
  SLUG_PATTERN,
  CANONICAL_PATTERN,
};

if (require.main === module) {
  const { getMode } = require('./lib/mode');
  const mode = getMode();

  if (mode === 'preview') {
    console.error('\nPreview-mode validation is not implemented yet (planned for Phase 5). Use --mode=development or --mode=production.');
    process.exit(1);
  }

  const dataDir = path.join(__dirname, '..', 'data');
  const { errors, warnings } = validateAll({ dataDir, mode });

  if (warnings.length > 0) {
    console.warn(`\nValidation warnings (mode=${mode}):`);
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\nValidation failed (mode=${mode}) with ${errors.length} error(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`\nValidation passed (mode=${mode}). ${warnings.length} warning(s).`);
}
