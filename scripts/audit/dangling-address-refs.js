#!/usr/bin/env node
/**
 * Phase 4 audit: scan adapter source files for `ADDRESSES.<chain>.<key>` refs
 * that don't resolve to a real entry in coreAssets.json.
 *
 * In adapter code, an unresolved address reference silently evaluates to
 * `undefined` — which then gets passed to multiCall, RPCs, or summing
 * helpers. Depending on the helper, that either:
 *   - throws downstream (loud), or
 *   - is silently skipped (TVL undercount, no error).
 *
 * Both are bugs. The silent-skip variant is the more dangerous one because
 * it can quietly drop a chain's contribution to a protocol's TVL for months.
 *
 * Usage:
 *   node scripts/audit/dangling-address-refs.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PROJECTS = path.join(ROOT, 'projects');
const CORE = JSON.parse(
  fs.readFileSync(path.join(PROJECTS, 'helper', 'coreAssets.json'), 'utf-8')
);

const RE = /\bADDRESSES\.([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\b/g;

const findings = [];
let scanned = 0;

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) { return; }
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(p);
    } else if (entry.isFile() && /\.(js|ts)$/.test(entry.name)) {
      scanFile(p);
    }
  }
}

function stripComments(src) {
  // strip /* ... */ and // ... — line-based, conservative
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function scanFile(file) {
  let src;
  try { src = fs.readFileSync(file, 'utf-8'); } catch (_) { return; }
  if (!src.includes('ADDRESSES.')) return;
  src = stripComments(src);
  scanned++;
  let m;
  RE.lastIndex = 0;
  const seen = new Set();
  while ((m = RE.exec(src))) {
    const chain = m[1];
    const key = m[2];
    const sig = `${chain}.${key}`;
    if (seen.has(sig)) continue;
    seen.add(sig);

    const chainBucket = CORE[chain];
    // If chain entry is a direct string (top-level address like
    // ADDRESSES.GAS_TOKEN_2 = "0xeeee...") then `.<key>` is a method call
    // on the string — not a coreAssets reference. Skip.
    if (typeof chainBucket === 'string') continue;
    if (!chainBucket || typeof chainBucket !== 'object') {
      findings.push({
        kind: 'missing-chain',
        file: path.relative(ROOT, file),
        chain, key,
      });
      continue;
    }
    if (!(key in chainBucket)) {
      findings.push({
        kind: 'missing-key',
        file: path.relative(ROOT, file),
        chain, key,
        nearestKeys: nearestKeys(key, Object.keys(chainBucket)),
      });
    }
  }
}

function nearestKeys(needle, haystack) {
  const N = needle.toUpperCase();
  return haystack
    .map(k => ({ k, d: editDistance(N, k.toUpperCase()) }))
    .filter(x => x.d <= 2 || x.k.toUpperCase().startsWith(N) || N.startsWith(x.k.toUpperCase()))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map(x => x.k);
}

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

walk(PROJECTS);

console.log(`Scanned: ${scanned} adapter files`);
console.log(`Findings: ${findings.length}`);
console.log();

const byKind = {};
for (const f of findings) {
  byKind[f.kind] ??= [];
  byKind[f.kind].push(f);
}

for (const [kind, items] of Object.entries(byKind)) {
  console.log(`── ${kind} (${items.length}) ──`);
  for (const f of items.slice(0, 50)) {
    const near = f.nearestKeys?.length
      ? `  (did you mean: ${f.nearestKeys.join(', ')})`
      : '';
    console.log(`  ${f.file} :: ADDRESSES.${f.chain}.${f.key}${near}`);
  }
  if (items.length > 50) console.log(`  …and ${items.length - 50} more`);
  console.log();
}

if (process.env.AUDIT_JSON) {
  console.log('--- JSON ---');
  console.log(JSON.stringify(findings, null, 2));
}

if (findings.length > 0) process.exit(1);
