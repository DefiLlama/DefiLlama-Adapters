require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getEnv } = require('../../projects/helper/env');

/** Scan adapters for `ADDRESSES.<chain>.<key>` refs that don't resolve to a
 * real entry in coreAssets.json. Unresolved refs evaluate to `undefined` and
 * either throw downstream or get silently dropped, causing TVL to be undercounted. */
const ROOT = path.join(__dirname, '..', '..');
const PROJECTS = path.join(ROOT, 'projects');
const CORE = JSON.parse(
  fs.readFileSync(path.join(PROJECTS, 'helper', 'coreAssets.json'), 'utf-8')
);

const RE = /\bADDRESSES\.([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\b/g;

// Based on defillama-server/defi/src/utils/discord.ts
async function sendDiscord(message, formatted = true) {
  const webhookUrl = getEnv('TEAM_WEBHOOK');
  if (!webhookUrl) {
    throw new Error(`Missing TEAM_WEBHOOK env var. Could not send: "${message}"`);
  }
  const formattedMessage = formatted ? '```\n' + message + '\n```' : message;
  if (formattedMessage.length >= 2000) {
    const lines = message.split('\n');
    if (lines.length <= 2) throw new Error('Lines are too long, reaching infinite recursivity');
    const mid = Math.round(lines.length / 2);
    await sendDiscord(lines.slice(0, mid).join('\n'), formatted);
    await sendDiscord(lines.slice(mid).join('\n'), formatted);
    return;
  }
  await axios.post(`${webhookUrl}?wait=true`, { content: formattedMessage }, {
    headers: { 'Content-Type': 'application/json' },
  });
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ''))
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function scanFile(file, findings) {
  let src;
  try { src = fs.readFileSync(file, 'utf-8'); } catch (_) { return; }
  if (!src.includes('ADDRESSES.')) return;
  src = stripComments(src);
  RE.lastIndex = 0;
  const seen = new Set();
  let m;
  while ((m = RE.exec(src))) {
    const chain = m[1];
    const key = m[2];
    const sig = `${chain}.${key}`;
    if (seen.has(sig)) continue;
    seen.add(sig);

    const chainBucket = CORE[chain];
    // Skip top-level string entries like `ADDRESSES.GAS_TOKEN_2 = "0xeeee..."`
    // — there `.<key>` is a string method, not a coreAssets lookup.
    if (typeof chainBucket === 'string') continue;

    const line = src.slice(0, m.index).split('\n').length;
    const relFile = path.relative(ROOT, file);

    if (!chainBucket || typeof chainBucket !== 'object') {
      findings.push({ file: relFile, line, ref: sig, kind: 'missing-chain' });
    } else if (!(key in chainBucket)) {
      findings.push({ file: relFile, line, ref: sig, kind: 'missing-key' });
    }
  }
}

function formatFindings(findings) {
  if (!findings.length) return null;
  const byKind = {};
  for (const f of findings) (byKind[f.kind] ??= []).push(f);
  const lines = [`Found ${findings.length} undefined ADDRESSES refs:`, ''];
  for (const [kind, items] of Object.entries(byKind)) {
    lines.push(`── ${kind} (${items.length}) ──`);
    for (const f of items) lines.push(`  ${f.file}:${f.line}  ADDRESSES.${f.ref}`);
    lines.push('');
  }
  return lines.join('\n');
}

async function run() {
  const files = fs.readdirSync(PROJECTS, { recursive: true })
    .filter(f => /\.(js|ts)$/.test(f))
    .map(f => path.join(PROJECTS, f));

  const findings = [];
  for (const file of files) scanFile(file, findings);

  console.log(`Scanned ${files.length} files, found ${findings.length} undefined refs`);
  const message = formatFindings(findings);
  if (message) {
    console.log(message);
    await sendDiscord(message);
  } else {
    console.log('No undefined ADDRESSES references found.');
  }
}

run().catch(async (e) => {
  console.error(e);
  try {
    await sendDiscord(`check-core-assets-refs failed: ${e.message}`);
  } catch (sendErr) {
    console.error('Also failed to send discord error:', sendErr.message);
  }
  process.exitCode = 1;
});
