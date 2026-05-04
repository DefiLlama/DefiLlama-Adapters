#!/usr/bin/env node
/**
 * Phase 3: DEX/AMM token-universe contamination scan.
 *
 * The DogePay class of bug: an adapter enumerates its token universe from
 * a chain's *explorer* API (or factory event scrape) rather than a curated
 * tokenlist registry, ends up summing TVL contributions from joke / scam /
 * exploit tokens whose `totalSupply()` is huge but whose price is null,
 * and over-states protocol TVL by orders of magnitude.
 *
 * This script flags candidate adapters for manual review:
 *   - reads each project file under projects/
 *   - searches for explorer / scan / api3 token-list fetches as the
 *     SOURCE of the token universe (not just metadata enrichment)
 *   - notes patterns that historically corresponded to bug findings:
 *       * fetching from explorer.<chain>.{xyz,fun,io}/api?...
 *       * iterating factory createPair logs and counting all returned tokens
 *       * "use any token with non-zero balance" loops
 *
 * Heuristics, not proofs — output is a triage list, not auto-bug-reports.
 *
 * Usage:
 *   node scripts/audit-dex-token-universe.js
 *   node scripts/audit-dex-token-universe.js --pattern=explorer
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_ROOT = path.join(__dirname, '..', '..', 'projects');

const SUSPICIOUS_PATTERNS = [
  {
    name: 'explorer-token-list-fetch',
    severity: 'high',
    description: 'adapter sources its token universe from a generic explorer API — this enumerates EVERY token on the chain, including joke/scam tokens',
    regexes: [
      /explorer\.[a-z0-9._-]+\.(xyz|com|io|fun|app)\/api[?\/]/i,
      /scan\.[a-z0-9._-]+\.(xyz|com|io|fun|app)\/api[?\/]/i,
      /\/api\?module=account&action=tokenlist/i,
      /\/api\/v[12]\/tokens(?!\/list\/)/i,
    ],
  },
  {
    name: 'factory-pair-enumeration',
    severity: 'medium',
    description: 'pair/pool universe sourced by enumerating ALL factory events (no whitelist) — incoming joke pairs leak into TVL',
    regexes: [
      /allPairs\(.*\)/,
      /allPairsLength/,
      /getPair\([^)]*\)\.flat/,
    ],
  },
  {
    name: 'balance-of-anything',
    severity: 'medium',
    description: 'sums every token a treasury/operator address holds via off-chain index (any token whose `balanceOf` is non-zero) — junk dust tokens contribute',
    regexes: [
      /balance.*any\s*token/i,
      /(?:portfolio|holdings)\s*:\s*await/i,
      /tokens\s*=.*Set\(.*balances/i,
    ],
  },
  {
    name: 'unfiltered-multicall-totalSupply',
    severity: 'medium',
    description: 'reads totalSupply across a bulk token list with no decimals/name validation — bad-decimals tokens can over-contribute',
    regexes: [
      /erc20:totalSupply.*\.flat/,
      /tokens\.map.*\{.*totalSupply.*decimals.*18/i,
    ],
  },
];

const OFFICIAL_TOKENLIST_HINTS = [
  /tokenlist\.[a-z0-9.-]+\.(xyz|com|io)\/list\//i,
  /tokens\.coingecko\.com/i,
  /raw\.githubusercontent\.com.*tokenlist/i,
  /tokens\.uniswap\.org/i,
];

const PROJECT_FILE_BLACKLIST = new Set([
  'helper', 'sumTokens', // not project dirs in the proper sense
]);

const args = process.argv.slice(2);
const filterPattern = args.find(a => a.startsWith('--pattern='))?.split('=')[1];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (PROJECT_FILE_BLACKLIST.has(e.name)) continue;
      yield* walk(full);
    } else if (e.isFile() && /\.(js|ts)$/.test(e.name)) {
      yield full;
    }
  }
}

const findings = [];
let scanned = 0;

for (const file of walk(PROJECTS_ROOT)) {
  scanned++;
  let content;
  try { content = fs.readFileSync(file, 'utf-8'); } catch { continue; }
  if (content.length > 200_000) continue; // skip very large generated bundles

  // What we're looking for: an adapter that PULLS its token universe from
  // an unsafe source. False-positive guard: if the same file ALSO references
  // a curated tokenlist registry, treat it as already mitigated.
  const usesCuratedSource = OFFICIAL_TOKENLIST_HINTS.some(h => h.test(content));

  for (const pat of SUSPICIOUS_PATTERNS) {
    if (filterPattern && pat.name !== filterPattern) continue;

    for (const rx of pat.regexes) {
      const m = content.match(rx);
      if (!m) continue;

      // Hint: which line
      const idx = content.indexOf(m[0]);
      const line = content.slice(0, idx).split('\n').length;
      const projectName = path.relative(PROJECTS_ROOT, file).split(path.sep).slice(0, 2).join('/');

      findings.push({
        severity: pat.severity,
        kind: pat.name,
        description: pat.description,
        project: projectName,
        file: path.relative(PROJECTS_ROOT, file),
        line,
        match: m[0].slice(0, 120),
        usesCuratedSource,
      });
      break; // one match per pattern per file
    }
  }
}

console.log(`Scanned ${scanned} adapter files`);
console.log(`Findings: ${findings.length}`);
console.log();

const grouped = {};
for (const f of findings) {
  grouped[f.kind] ??= [];
  grouped[f.kind].push(f);
}

const SEV = { high: 2, medium: 1, low: 0 };
const sortedKinds = Object.entries(grouped).sort(
  (a, b) => SEV[b[1][0].severity] - SEV[a[1][0].severity]);

for (const [kind, items] of sortedKinds) {
  console.log(`── ${kind} (${items.length}) ──`);
  console.log(`   ${items[0].description}`);
  console.log();
  // sort: those WITHOUT curated-source mitigation first
  items.sort((a, b) => Number(a.usesCuratedSource) - Number(b.usesCuratedSource));
  for (const f of items) {
    const flag = f.usesCuratedSource ? '  ⚠ ' : '  ✗ ';
    console.log(`${flag}[${f.severity}] ${f.project}  →  ${f.file}:${f.line}`);
    console.log(`     ${f.match}`);
    if (f.usesCuratedSource) {
      console.log(`     (also references a curated tokenlist — likely already mitigated)`);
    }
  }
  console.log();
}

if (process.env.AUDIT_JSON) {
  console.log('--- JSON ---');
  console.log(JSON.stringify(findings, null, 2));
}
