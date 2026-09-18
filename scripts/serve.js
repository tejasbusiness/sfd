'use strict';

// Local-only static preview server for dist/. Not a deployment target —
// convenient for previewing generated output and for later QA of direct
// navigation / refresh behaviour on nested routes (docs/09-build-and-qa.md).

const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'dist');
const port = Number(process.env.PORT) || 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function resolveFilePath(urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(rootDir, safePath);

  if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }
  return filePath;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const filePath = resolveFilePath(urlPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      const notFoundPath = path.join(rootDir, '404.html');
      fs.readFile(notFoundPath, (err404, notFoundContent) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(err404 ? 'Not found (404.html does not exist yet — Phase 5)' : notFoundContent);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`Local preview server running at http://localhost:${port}/ (serving dist/)`);
});
