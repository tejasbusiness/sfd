'use strict';

const path = require('path');
const { getMode } = require('./lib/mode');
const { validateAll } = require('./validate-data');
const { renderPages, copyIfExists } = require('./generate-pages');

function main() {
  const mode = getMode();

  if (mode === 'preview') {
    console.error('\nPreview-mode builds are not implemented yet (planned for Phase 5: separate prospect data input and isolated deployment destination). Use --mode=development or --mode=production.');
    process.exit(1);
  }

  const rootDir = path.join(__dirname, '..');
  const dataDir = path.join(rootDir, 'data');
  const templatesDir = path.join(rootDir, 'templates');
  const outDir = path.join(rootDir, 'dist');
  const assetsDir = path.join(rootDir, 'assets');
  const publicDir = path.join(rootDir, 'public');

  console.log(`\nSFD build starting (mode=${mode})`);

  const { errors, warnings, pages, sharedData } = validateAll({ dataDir, mode });

  if (warnings.length > 0) {
    console.warn('Validation warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\nBuild aborted: ${errors.length} validation error(s) (mode=${mode}):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  const written = renderPages({ templatesDir, outDir, mode, sharedData, pages });
  copyIfExists(assetsDir, path.join(outDir, 'assets'));
  copyIfExists(publicDir, outDir);

  console.log(`\nBuild succeeded (mode=${mode}). ${written.length} page(s) written to dist/:`);
  written.forEach((f) => console.log(`  - dist/${f.replace(/\\/g, '/')}`));
}

main();
