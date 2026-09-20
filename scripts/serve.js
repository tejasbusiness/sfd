'use strict';

// Local-only static preview server for dist/. Not a deployment target. It mimics
// the production nginx rules in deploy/nginx-redirects.conf so redirects and the
// genuine 404 can be checked locally (docs/09-build-and-qa.md):
//   - directory URLs without a trailing slash -> 301 to the slash version
//   - /path/index.html -> 301 to /path/
//   - data/redirects.json entries -> 301 (single hop)
//   - anything missing -> 404.html with a real 404 status, never the homepage
//   - /api/* is proxied to PHP's built-in server running api/public/index.php with
//     .env-local, so forms and booking work locally (open the SSH tunnel first:
//     npm run tunnel). If php is not installed, /api/* answers 503.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.join(__dirname, '..', 'dist');
const redirectsFile = path.join(__dirname, '..', 'data', 'redirects.json');
const port = Number(process.env.PORT) || 8080;
const apiPort = Number(process.env.API_PORT) || 8081;
const projectRoot = path.join(__dirname, '..');

let phpReady = false;
const php = spawn('php', ['-S', `127.0.0.1:${apiPort}`, path.join(projectRoot, 'api', 'public', 'index.php')], {
  env: { ...process.env, SFD_ENV_FILE: path.join(projectRoot, '.env-local') },
  stdio: ['ignore', 'ignore', 'ignore'],
});
php.on('spawn', () => {
  phpReady = true;
});
php.on('error', () => {
  phpReady = false;
  console.warn('php was not found: /api/* will return 503 (install PHP 8.2+ to test forms locally).');
});
process.on('exit', () => php.kill());
process.on('SIGINT', () => process.exit(0));

function proxyApi(req, res) {
  if (!phpReady) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end('{"ok":false,"error":"api_unavailable"}');
  }
  const upstream = http.request(
    { host: '127.0.0.1', port: apiPort, path: req.url, method: req.method, headers: { ...req.headers, host: `127.0.0.1:${apiPort}` } },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );
  upstream.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end('{"ok":false,"error":"api_unreachable"}');
  });
  req.pipe(upstream);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function loadRedirects() {
  try {
    return JSON.parse(fs.readFileSync(redirectsFile, 'utf8'));
  } catch (err) {
    return [];
  }
}

function redirect(res, location) {
  res.writeHead(301, { Location: location });
  res.end();
}

function sendNotFound(req, res) {
  fs.readFile(path.join(rootDir, '404.html'), (err, content) => {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : err ? 'Not found (run npm run build to generate 404.html)' : content);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?')) return proxyApi(req, res);

  const [rawPath, query] = req.url.split('?');
  const search = query ? `?${query}` : '';

  let urlPath;
  try {
    urlPath = decodeURIComponent(rawPath);
  } catch (err) {
    return sendNotFound(req, res);
  }

  if (/\/index\.html$/.test(urlPath)) return redirect(res, urlPath.slice(0, -'index.html'.length) + search);

  const match = loadRedirects().find(({ from }) => urlPath === from || `${urlPath}/` === from);
  if (match) return redirect(res, match.to + search);

  const target = path.join(rootDir, path.normalize(urlPath));
  if (target !== rootDir && !target.startsWith(rootDir + path.sep)) return sendNotFound(req, res);
  // 404.html is only reachable through the error handler, as in nginx (`internal`).
  if (urlPath === '/404.html') return sendNotFound(req, res);

  fs.stat(target, (err, stats) => {
    if (!err && stats.isDirectory()) {
      if (!urlPath.endsWith('/')) return redirect(res, `${urlPath}/${search}`);
      return sendFile(req, res, path.join(target, 'index.html'));
    }
    if (!err && stats.isFile()) return sendFile(req, res, target);
    return sendNotFound(req, res);
  });
});

function sendFile(req, res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) return sendNotFound(req, res);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
}

server.listen(port, () => {
  console.log(`Local preview server running at http://localhost:${port}/ (serving dist/)`);
});
