#!/usr/bin/env node
/**
 * Structural audit of projects/helper/coreAssets.json.
 *
 * Catches "always-on" data bugs that DefiLlama's TVL spike detector cannot —
 * because they don't manifest as a time-series anomaly, they're just wrong
 * from day one (e.g. a wrong-decimals constant, a stale address, a copy-
 * pasted entry from another chain). Spike detector watches for changes;
 * this watches for shapes.
 *
 * Phase 1 (this script, no RPC): JSON-only structural checks.
 *   - Address checksum sanity (EIP-55 + length)
 *   - Address re-use across chains via the same key (suspicious copy-paste)
 *   - Symbol shadowing (same symbol mapped to different addresses on the
 *     same chain via aliasing)
 *   - Suspicious naming patterns (joke / scam / TEST / MOCK)
 *   - Empty / placeholder addresses
 *
 * Phase 2 (separate script, optional RPC): on-chain reconciliation.
 *   - balanceOf + decimals + symbol against on-chain truth
 *
 * Usage:
 *   node scripts/audit-core-assets.js
 *   node scripts/audit-core-assets.js --severity=high
 *   node scripts/audit-core-assets.js --chain=tempo
 */

const fs = require('fs');
const path = require('path');

const CORE_ASSETS_PATH = path.join(__dirname, '..', '..', 'projects', 'helper', 'coreAssets.json');
const data = JSON.parse(fs.readFileSync(CORE_ASSETS_PATH, 'utf-8'));

// CLI flags
const args = process.argv.slice(2);
const filterChain = args.find(a => a.startsWith('--chain='))?.split('=')[1];
const minSeverity = args.find(a => a.startsWith('--severity='))?.split('=')[1] || 'low';
const SEVERITY_RANK = { low: 0, medium: 1, high: 2 };

const findings = [];

const flag = (severity, kind, chain, symbol, detail, evidence = {}) => {
  findings.push({ severity, kind, chain, symbol, detail, evidence });
};

// ── EIP-55 checksum validation ─────────────────────────────────────────────
// Lightweight EIP-55 re-implementation; avoids requiring ethers at script
// load time. Returns the canonical checksummed form, or null on bad shape.
const { keccak256 } = require('ethers');
function checksum(addr) {
  if (typeof addr !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(addr)) return null;
  const lower = addr.toLowerCase().slice(2);
  const hash = keccak256(Buffer.from(lower, 'utf-8')).slice(2);
  let out = '0x';
  for (let i = 0; i < lower.length; i++) {
    out += parseInt(hash[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  }
  return out;
}

// ── EVM-only chain heuristic ───────────────────────────────────────────────
// coreAssets contains both EVM and non-EVM (Solana, Sui, Cosmos, …). Only
// run EIP-55 checks on EVM-shaped entries. Non-EVM addresses don't follow
// 0x40-hex layout, so the regex above already filters them out — but we
// also skip checksum reporting on them to avoid noise.
const isEvmAddress = a => typeof a === 'string' && /^0x[0-9a-fA-F]{40}$/.test(a);

const SUSPICIOUS_NAME_PATTERNS = [
  /^TEST_?/i, /^MOCK_?/i, /^FAKE_?/i, /^DEMO_?/i,
  /DOGE/i, /SHIB/i, /PEPE/i, /INU(?!ity)/i,
  /EXPLOIT/i, /SCAM/i, /HACK/i,
  /^XYZ/i, /^ABC/i, /^123/i,
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const PLACEHOLDER_PATTERNS = [
  /^0x0{40}$/, /^0x[fF]{40}$/, /^0xdead/i, /^0xbeef0{36}$/i,
];

// ── Cross-chain address re-use index ───────────────────────────────────────
// Same address appearing on multiple chains under the same logical symbol
// is OK for tokens that are deployed deterministically (CREATE2). Same
// address under DIFFERENT symbols across chains is a copy-paste smell.
const addressIndex = new Map(); // lowercased address → [{chain, symbol}]

// ── Run checks per chain ──────────────────────────────────────────────────
for (const [chainOrKey, value] of Object.entries(data)) {
  // Top-level non-chain keys (null, GAS_TOKEN_2 …) are sentinels, skip.
  if (typeof value !== 'object' || value === null) continue;
  if (filterChain && chainOrKey !== filterChain) continue;

  const chain = chainOrKey;
  const symbolsOnThisChain = new Map(); // canonical address → [symbol1, symbol2…]

  for (const [symbol, address] of Object.entries(value)) {
    // 1. Suspicious naming pattern in the symbol itself
    for (const pat of SUSPICIOUS_NAME_PATTERNS) {
      if (pat.test(symbol)) {
        flag('medium', 'suspicious-symbol-name', chain, symbol,
          `symbol matches suspicious pattern ${pat}`,
          { address, pattern: pat.toString() });
        break;
      }
    }

    // 2. Placeholder / dead-default address values
    if (typeof address === 'string') {
      for (const pat of PLACEHOLDER_PATTERNS) {
        if (pat.test(address) && symbol !== 'NULL' && symbol !== 'NULL_ADDRESS') {
          flag('medium', 'placeholder-address', chain, symbol,
            `address matches placeholder pattern ${pat}`,
            { address });
          break;
        }
      }
    }

    // 3. EVM EIP-55 checksum (skip non-EVM)
    if (isEvmAddress(address)) {
      const expected = checksum(address);
      // Allow either checksummed or all-lowercase (the established
      // convention in coreAssets.json — most entries are lowercase).
      const isAllLower = address === address.toLowerCase();
      const isProperChecksum = address === expected;
      if (!isAllLower && !isProperChecksum) {
        flag('high', 'bad-checksum', chain, symbol,
          'EIP-55 checksum is invalid (mixed case but does not validate)',
          { address, expected });
      }

      // 4. Cross-chain address re-use bookkeeping
      const lower = address.toLowerCase();
      if (!addressIndex.has(lower)) addressIndex.set(lower, []);
      addressIndex.get(lower).push({ chain, symbol });

      // 5. Same address mapped to multiple symbols on the SAME chain
      const sameAddrEntries = symbolsOnThisChain.get(lower) || [];
      sameAddrEntries.push(symbol);
      symbolsOnThisChain.set(lower, sameAddrEntries);
    }
  }

  // Emit "duplicate within chain" findings after the per-chain loop
  for (const [addr, syms] of symbolsOnThisChain) {
    if (syms.length > 1) {
      flag('low', 'duplicate-within-chain', chain, syms.join(','),
        `${syms.length} symbols on ${chain} all point to ${addr}`,
        { address: addr, symbols: syms });
    }
  }
}

// ── Cross-chain duplicate analysis ────────────────────────────────────────
for (const [addr, entries] of addressIndex) {
  if (entries.length <= 1) continue;
  const distinctSymbols = new Set(entries.map(e => e.symbol));
  if (distinctSymbols.size > 1) {
    // Same address on multiple chains carrying DIFFERENT symbols —
    // copy-paste smell.
    flag('medium', 'cross-chain-symbol-mismatch',
      entries.map(e => e.chain).join(','),
      [...distinctSymbols].join(' / '),
      `address ${addr} appears under ${distinctSymbols.size} distinct symbols across chains`,
      { address: addr, occurrences: entries });
  }
}

// ── Output ────────────────────────────────────────────────────────────────
const ranked = findings
  .filter(f => SEVERITY_RANK[f.severity] >= SEVERITY_RANK[minSeverity])
  .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

console.log(`Scanned ${Object.keys(data).length} top-level keys, ${addressIndex.size} unique EVM addresses`);
console.log(`Findings: ${ranked.length} (filtered to severity >= ${minSeverity})`);
console.log();

const grouped = {};
for (const f of ranked) {
  grouped[f.kind] ??= [];
  grouped[f.kind].push(f);
}
for (const [kind, items] of Object.entries(grouped)) {
  console.log(`── ${kind} (${items.length}) ──`);
  for (const f of items.slice(0, 20)) {
    console.log(`  [${f.severity}] ${f.chain} :: ${f.symbol}`);
    console.log(`     ${f.detail}`);
    if (f.evidence.address) console.log(`     address: ${f.evidence.address}`);
    if (f.evidence.expected) console.log(`     expected: ${f.evidence.expected}`);
  }
  if (items.length > 20) console.log(`  … +${items.length - 20} more`);
  console.log();
}

if (process.env.AUDIT_JSON) {
  console.log('--- JSON OUTPUT ---');
  console.log(JSON.stringify(ranked, null, 2));
}

process.exit(ranked.some(f => f.severity === 'high') ? 1 : 0);
