#!/usr/bin/env node
/**
 * Phase 2 audit: cross-checks coreAssets.json entries against on-chain
 * `symbol()` calls.
 *
 * For each EVM chain in coreAssets, multicalls every entry's address for
 * its on-chain `symbol()` and compares against the key. Flags:
 *
 *   - mismatch  : on-chain symbol differs (e.g. coreAssets says "USDC" but
 *                 the contract is actually "USDT" — wrong-address bug)
 *   - dead      : address has no contract code
 *   - reverts   : contract has code but `symbol()` reverts (suspicious)
 *
 * Designed to run on a curated chain set (default top-by-TVL); pass
 * --chain=<name> to scope. RPC reads via @defillama/sdk.
 *
 * Usage:
 *   node scripts/audit-onchain-symbols.js
 *   node scripts/audit-onchain-symbols.js --chain=ethereum
 *   node scripts/audit-onchain-symbols.js --chains=ethereum,bsc,polygon
 *   node scripts/audit-onchain-symbols.js --address=0x...   # single check
 */

const fs = require('fs');
const path = require('path');
const sdk = require('@defillama/sdk');

const CORE_ASSETS_PATH = path.join(__dirname, '..', '..', 'projects', 'helper', 'coreAssets.json');
const data = JSON.parse(fs.readFileSync(CORE_ASSETS_PATH, 'utf-8'));

const args = process.argv.slice(2);
const chainArg = args.find(a => a.startsWith('--chain='))?.split('=')[1];
const chainsArg = args.find(a => a.startsWith('--chains='))?.split('=')[1];
const singleAddress = args.find(a => a.startsWith('--address='))?.split('=')[1];

// Curated default set: chains where bugs would have the highest impact.
const DEFAULT_CHAINS = [
  'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base',
  'avax', 'fantom', 'gnosis', 'linea', 'scroll', 'mode',
  'metis', 'celo', 'mantle', 'blast', 'manta', 'sei',
];

let chainsToCheck;
if (singleAddress) {
  chainsToCheck = [chainArg || 'ethereum'];
} else if (chainArg) {
  chainsToCheck = [chainArg];
} else if (chainsArg) {
  chainsToCheck = chainsArg.split(',').map(s => s.trim());
} else {
  chainsToCheck = DEFAULT_CHAINS;
}

// Symbols whose key shape we should NOT compare strictly against on-chain
// `symbol()` — naming conventions in coreAssets diverge from contract names
// for legitimate reasons (e.g. "WETH_1" in fuse, "ceUSDC" in moonbeam, "USDC_e").
const KEY_NORMALIZE = key => key
  .replace(/_OFT$/i, '')
  .replace(/_e$/i, '.e')
  .replace(/^ce/, '')
  .replace(/_\d+$/i, '')
  .replace(/_OLD$/i, '')
  .replace(/_NEW$/i, '')
  .toUpperCase();

const isEvmAddress = a => typeof a === 'string' && /^0x[0-9a-fA-F]{40}$/.test(a) && !/^0x[0fF]{40}$/.test(a);

const findings = [];

async function auditChain(chain) {
  const entries = data[chain];
  if (!entries || typeof entries !== 'object') return;

  const items = Object.entries(entries)
    .filter(([_, v]) => isEvmAddress(v))
    .map(([k, v]) => ({ key: k, address: v }));

  if (singleAddress) {
    items.length = 0;
    items.push({ key: '?', address: singleAddress });
  }

  if (!items.length) return;

  console.log(`▸ ${chain}: ${items.length} EVM tokens to audit…`);

  // Read symbol() with permitFailure so reverts surface
  let res;
  try {
    res = await sdk.api.abi.multiCall({
      chain,
      abi: 'erc20:symbol',
      calls: items.map(i => ({ target: i.address })),
      permitFailure: true,
    });
  } catch (e) {
    console.log(`  ✗ ${chain}: multiCall failed: ${e.message?.slice(0, 100)}`);
    return;
  }

  // Also read code presence in batches via getCodeBatch (sdk has eth.getCode)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = res.output[i];
    if (!result.success) {
      // Could be no-code (dead) or reverting symbol(). Distinguish by getting code.
      let isDead = false;
      try {
        const code = await sdk.api.eth.getCode({ chain, target: item.address });
        isDead = !code || code === '0x';
      } catch (_) {}
      findings.push({
        severity: 'high',
        kind: isDead ? 'dead-contract' : 'symbol-reverts',
        chain,
        key: item.key,
        address: item.address,
        detail: isDead
          ? 'address has no contract code on-chain'
          : 'contract exists but symbol() reverts',
      });
      continue;
    }
    const onChainSymbol = String(result.output || '').trim();
    if (!onChainSymbol) {
      findings.push({
        severity: 'medium', kind: 'empty-symbol', chain,
        key: item.key, address: item.address,
        detail: 'symbol() returned empty string',
      });
      continue;
    }
    const normalizedKey = KEY_NORMALIZE(item.key);
    const normalizedSym = onChainSymbol.toUpperCase().replace(/^W/, '').replace(/\.E$/, '');
    const looselyMatches =
      normalizedKey === onChainSymbol.toUpperCase() ||
      normalizedKey === normalizedSym ||
      ('W' + normalizedKey) === onChainSymbol.toUpperCase() ||
      normalizedKey.includes(onChainSymbol.toUpperCase()) ||
      onChainSymbol.toUpperCase().includes(normalizedKey);

    if (!looselyMatches) {
      findings.push({
        severity: 'high', kind: 'symbol-mismatch', chain,
        key: item.key, address: item.address,
        detail: `coreAssets key "${item.key}" but on-chain symbol() returns "${onChainSymbol}"`,
        evidence: { keyNormalized: normalizedKey, onChainSymbol },
      });
    }
  }
}

(async () => {
  for (const chain of chainsToCheck) {
    await auditChain(chain).catch(e =>
      console.log(`  ✗ ${chain}: ${e.message?.slice(0, 200)}`));
  }

  console.log();
  console.log(`Findings: ${findings.length}`);
  console.log();
  const grouped = {};
  for (const f of findings) {
    grouped[f.kind] ??= [];
    grouped[f.kind].push(f);
  }
  for (const [kind, items] of Object.entries(grouped)) {
    console.log(`── ${kind} (${items.length}) ──`);
    for (const f of items) {
      console.log(`  [${f.severity}] ${f.chain} :: ${f.key}`);
      console.log(`     ${f.detail}`);
      console.log(`     address: ${f.address}`);
    }
    console.log();
  }
  if (process.env.AUDIT_JSON) {
    console.log('--- JSON ---');
    console.log(JSON.stringify(findings, null, 2));
  }
})();
