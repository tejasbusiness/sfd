'use strict';

// Development-only helper: takes desktop, tablet and phone screenshots of every project
// in data/projects.json with headless Chrome or Edge (driven over the DevTools protocol,
// so it waits in real time for entrance animations) and saves them as
// assets/images/portfolio/<id>-<device>.jpg (docs/04). The site frames them with CSS as
// a responsive mockup. Re-run it to refresh a project's images.
//
//   node scripts/capture-portfolio.js            all projects
//   node scripts/capture-portfolio.js cawt       one project id
//   WAIT_MS=10000 node scripts/capture-portfolio.js cawt   wait longer per page
//
// Not part of the build: the committed images are what ships. Needs Node 22+ (global WebSocket).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'images', 'portfolio');
const DEVICES = { desktop: [1440, 900, false], tablet: [820, 1100, true], mobile: [390, 800, true] };
const WAIT_MS = Number(process.env.WAIT_MS) || 6000;
const PORT = 9333;

const BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForTarget() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (err) {
      // browser still starting
    }
    await sleep(200);
  }
  throw new Error('Browser did not start');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let nextId = 1;
    const pending = new Map();
    const listeners = [];
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { ok, fail } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) fail(new Error(msg.error.message));
        else ok(msg.result);
      } else if (msg.method) {
        listeners.forEach((fn) => fn(msg));
      }
    };
    ws.onerror = () => reject(new Error('DevTools connection failed'));
    ws.onopen = () =>
      resolve({
        send: (method, params = {}) =>
          new Promise((ok, fail) => {
            const id = nextId++;
            pending.set(id, { ok, fail });
            ws.send(JSON.stringify({ id, method, params }));
          }),
        on: (fn) => listeners.push(fn),
        close: () => ws.close(),
      });
  });
}

async function main() {
  const browserPath = BROWSERS.find((p) => fs.existsSync(p));
  if (!browserPath) throw new Error('No Chrome or Edge found. Edit BROWSERS in this script.');

  const only = process.argv[2];
  const projects = JSON.parse(fs.readFileSync(path.join(root, 'data', 'projects.json'), 'utf8')).items.filter(
    (p) => p.url && (!only || p.id === only)
  );
  fs.mkdirSync(outDir, { recursive: true });

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sfd-shot-'));
  const browser = spawn(
    browserPath,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'],
    { stdio: 'ignore' }
  );

  try {
    const cdp = await connect(await waitForTarget());
    await cdp.send('Page.enable');
    let loaded = null;
    cdp.on((msg) => {
      if (msg.method === 'Page.loadEventFired' && loaded) loaded();
    });

    for (const project of projects) {
      for (const [device, [width, height, mobile]] of Object.entries(DEVICES)) {
        const file = path.join(outDir, `${project.id}-${device}.jpg`);
        try {
          await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
          const done = new Promise((resolve) => {
            loaded = resolve;
            setTimeout(resolve, 30000);
          });
          await cdp.send('Page.navigate', { url: project.url });
          await done;
          await sleep(WAIT_MS);
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
          fs.writeFileSync(file, Buffer.from(data, 'base64'));
          console.log(`ok   ${project.id} ${device}`);
        } catch (err) {
          console.log(`FAIL ${project.id} ${device}: ${err.message}`);
        }
      }
    }
    cdp.close();
  } finally {
    browser.kill();
    await sleep(500);
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
