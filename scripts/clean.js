'use strict';

const fs = require('fs');
const path = require('path');

for (const dir of ['dist', 'deploy']) {
  fs.rmSync(path.join(__dirname, '..', dir), { recursive: true, force: true });
  console.log(`Removed ${dir}/`);
}
