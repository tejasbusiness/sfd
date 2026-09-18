'use strict';

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'dist');
fs.rmSync(outDir, { recursive: true, force: true });
console.log('Removed dist/');
