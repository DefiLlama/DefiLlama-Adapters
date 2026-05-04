#!/usr/bin/env node
/**
 * Phase 4: find DEX/AMM adapters built on `getUniTVL` that DO NOT enable the
 * core-asset whitelist. Default is `useDefaultCoreAssets = false`, which means
 * EVERY pair token's balance contributes to TVL — same wide-open shape that
 * caused the DogePay over-state on Tempo's stable-dex.
 *
 * Heuristic: adapter calls `getUniTVL({...})` AND we cannot find a sibling
 * `useDefaultCoreAssets: true` AND a custom `coreAssets:` array isn't passed
 * either. False positives possible (some adapters supply a custom whitelist
 * that's hard to detect statically) — output is for triage.
 */
const fs = require('fs');
const path = require('path');
const PROJECTS_ROOT = path.join(__dirname, '..', '..', 'projects');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(js|ts)$/.test(e.name)) yield full;
  }
}

const findings = [];

for (const file of walk(PROJECTS_ROOT)) {
  let c;
  try { c = fs.readFileSync(file, 'utf-8'); } catch { continue; }
  if (!/getUniTVL\s*\(/.test(c)) continue;

  // For each getUniTVL call, capture the argument block and check
  const re = /getUniTVL\s*\(\s*\{([^}]+)\}\s*\)/g;
  let m;
  while ((m = re.exec(c))) {
    const args = m[1];
    const hasWhitelist = /useDefaultCoreAssets\s*:\s*true/.test(args);
    const hasCustomCoreAssets = /\bcoreAssets\s*:/.test(args);
    if (!hasWhitelist && !hasCustomCoreAssets) {
      const idx = m.index;
      const line = c.slice(0, idx).split('\n').length;
      const project = path.relative(PROJECTS_ROOT, file).split(path.sep).slice(0, 1)[0];
      findings.push({
        project, file: path.relative(PROJECTS_ROOT, file), line,
        snippet: m[0].slice(0, 200),
      });
    }
  }
}

console.log(`Adapters with getUniTVL but no whitelist: ${findings.length}`);
console.log();
for (const f of findings) {
  console.log(`✗ ${f.project}  →  ${f.file}:${f.line}`);
  console.log(`   ${f.snippet}`);
  console.log();
}
