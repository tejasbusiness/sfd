'use strict';

// Opens the SSH tunnel that lets local development reach the live MySQL server
// without exposing MySQL to the internet:
//   127.0.0.1:TUNNEL_LOCAL_PORT (your PC)  ->  127.0.0.1:3306 (on the VPS)
// Reads SSH_* values from .env-local (gitignored). Leave it running in its own terminal.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envFile = path.join(__dirname, '..', '.env-local');
if (!fs.existsSync(envFile)) {
  console.error('.env-local not found. Copy .env.example to .env-local and fill in the SSH_* and DB_* values.');
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
}

const missing = ['SSH_HOST', 'SSH_USER'].filter((key) => !env[key]);
if (missing.length) {
  console.error(`Missing in .env-local: ${missing.join(', ')}`);
  process.exit(1);
}

const localPort = env.TUNNEL_LOCAL_PORT || '3307';
const args = ['-N', '-L', `${localPort}:127.0.0.1:3306`, '-p', env.SSH_PORT || '22', '-o', 'ExitOnForwardFailure=yes', '-o', 'ServerAliveInterval=30'];
if (env.SSH_KEY_PATH) args.push('-i', env.SSH_KEY_PATH);
args.push(`${env.SSH_USER}@${env.SSH_HOST}`);

console.log(`Opening tunnel on 127.0.0.1:${localPort} -> ${env.SSH_HOST}:3306. Press Ctrl+C to close.`);
const child = spawn('ssh', args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code || 0));
