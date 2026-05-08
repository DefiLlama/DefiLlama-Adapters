#!/usr/bin/env node
/**
 * DeFiLlama Drift Scanner
 *
 * Autonomously detects untracked TVL across known protocol families on all
 * DeFiLlama chains. For each (chain × protocol-family) pair it:
 *   1. Detects whether the protocol is deployed on-chain
 *   2. Checks whether a DeFiLlama adapter already covers it
 *   3. Estimates the protocol's pool count as a TVL proxy
 *   4. Prints a ranked gap table + optionally generates adapter stubs
 *
 * Usage:
 *   node scripts/drift-scanner.js
 *   node scripts/drift-scanner.js --chains sonic,berachain,fraxtal
 *   node scripts/drift-scanner.js --families balancer-v2,algebra
 *   node scripts/drift-scanner.js --top 30 --gen-stubs
 *   node scripts/drift-scanner.js --chains all --concurrency 20
 *
 * Output:
 *   Table of gaps sorted by estimated pool count (proxy for TVL).
 *   With --gen-stubs: writes projects/<slug>/index.js for each gap.
 */

'use strict'

const fs     = require('fs')
const path   = require('path')
const https  = require('https')
const sdk    = require('@defillama/sdk')
const pLimit = require('p-limit')

// ── CLI ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (name, def) => {
  const i = argv.indexOf(name)
  if (i === -1) return def
  const next = argv[i + 1]
  return (next === undefined || next.startsWith('--')) ? def : next
}
const has = (name) => argv.includes(name)

function parseIntFlag(name, def, { min = 1 } = {}) {
  const v = parseInt(flag(name, String(def)), 10)
  return Number.isFinite(v) && v >= min ? v : def
}

const CHAINS_ARG         = flag('--chains', 'all')
const FAMILIES_ARG       = flag('--families', 'all')
const TOP                = parseIntFlag('--top', 50, { min: 0 })
const CONCURRENCY        = parseIntFlag('--concurrency', 15, { min: 1 })
const GEN_STUBS          = has('--gen-stubs')
const TIMEOUT_MS         = parseIntFlag('--timeout', 6000, { min: 1 })
const JSON_OUT           = flag('--json', null)
// v2.3: --max-blocks overrides per-family maxScanBlocks
const MAX_BLOCKS_OVERRIDE = (() => {
  const v = parseInt(flag('--max-blocks', ''), 10)
  return Number.isFinite(v) && v > 0 ? v : null
})()
// v2.4: --full-rescan ignores the incremental cache and scans the full window
const FULL_RESCAN = has('--full-rescan')

// ── Protocol family definitions ────────────────────────────────────────────
// Each family describes how to detect deployment and how to generate an adapter.

const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

const FAMILIES = {

  'balancer-v2': {
    name: 'Balancer V2',
    maxScanBlocks: 4_000_000,
    usesEventScan: true,
    detect: async (chain, maxBlocks, fromBlock = null, onScanned = null) => {
      const code = await getCode(chain, BALANCER_VAULT)
      if (code == null || code.length <= 4) return null
      const pools = await countEvents(chain, BALANCER_VAULT,
        '0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e',
        maxBlocks, fromBlock, onScanned)
      return { address: BALANCER_VAULT, pools }
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, BALANCER_VAULT, 'onChainTvl', 'balancer')),
    stub: (chain, info) => ({
      slug: `balancer-${chain}`,
      code: `'use strict'\nconst { onChainTvl } = require('../helper/balancer')\nmodule.exports = {\n  timetravel: false,\n  ${chain}: { tvl: onChainTvl('${BALANCER_VAULT}', 0) },\n}\n`,
    }),
  },

  'uniswap-v3': {
    name: 'Uniswap V3',
    factories: [
      '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
    ],
    poolTopic: '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118',
    maxScanBlocks: 4_000_000,
    usesEventScan: true,
    detect: async function(chain, maxBlocks, fromBlock = null, onScanned = null) {
      for (const factory of this.factories) {
        const code = await getCode(chain, factory)
        if (code != null && code.length > 4) {
          const pools = await countEvents(chain, factory, this.poolTopic, maxBlocks, fromBlock, onScanned)
          return { address: factory, pools }
        }
      }
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'uniswap')),
    stub: (chain, info) => ({
      slug: `uniswap-v3-${chain}`,
      code: `'use strict'\nconst { uniV3Export } = require('../helper/uniswapV3')\nmodule.exports = uniV3Export({\n  ${chain}: { factory: '${info.address}', fromBlock: 0 },\n})\n`,
    }),
  },

  'algebra': {
    name: 'Algebra CLMM',
    poolTopic: '0x91ccaa7a278130b65168c3a0c8d3bcae84cf5e43704342bd3ec0b59e59c036db',
    // v2.3: 15M blocks — covers the mystery 2021 Ethereum Algebra factory (0xfb8ed348...).
    maxScanBlocks: 15_000_000,
    usesEventScan: true,
    detect: async function(chain, maxBlocks, fromBlock = null, onScanned = null) {
      const candidates = await findFactoriesFromEvents(chain, this.poolTopic, maxBlocks, 100_000, 0, fromBlock, onScanned)
      if (!candidates || !candidates.length) return null
      const validated = []
      for (const c of candidates) {
        const code = await getCode(chain, c.address)
        if (code == null || code.length <= 4) continue
        if (c.samplePool) {
          const poolCode = await getCode(chain, c.samplePool)
          if (poolCode == null || poolCode.length <= 4) continue
        }
        validated.push(c)
      }
      if (!validated.length) return null
      return validated.sort((a, b) => b.pools - a.pools)
    },
    coveredBy: (chain, info, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'isAlgebra', 'algebra') &&
        adapterMentions(a, info.address)),
    stub: (chain, info) => ({
      slug: `algebra-clmm-${chain}-${info.address.slice(2, 8).toLowerCase()}`,
      code: `'use strict'\nconst { uniV3Export } = require('../helper/uniswapV3')\nmodule.exports = uniV3Export({\n  ${chain}: { factory: '${info.address}', fromBlock: 0, isAlgebra: true },\n})\n`,
    }),
  },

  'aave-v3': {
    name: 'Aave V3',
    providerFactory: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    poolSelector: '0xd1946dbc',
    // v2.3: Aave V3 launched Jan 2023 — 6M blocks covers all deployments
    maxScanBlocks: 6_000_000,
    detect: async (chain) => {
      const code = await getCode(chain, '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e')
      if (code != null && code.length > 4) return { address: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', pools: 1 }
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'aave')),
    stub: () => null,
  },

  'curve': {
    name: 'Curve DEX',
    addressProvider: '0x0000000022D53366457F9d5E68Ec105046FC4383',
    // v2.3: Curve launched 2020 — 25M blocks for full history on Ethereum-class chains
    maxScanBlocks: 25_000_000,
    detect: async (chain) => {
      const code = await getCode(chain, '0x0000000022D53366457F9d5E68Ec105046FC4383')
      if (code != null && code.length > 4) return { address: '0x0000000022D53366457F9d5E68Ec105046FC4383', pools: 1 }
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'curve')),
    stub: () => null,
  },

  'velodrome-cl': {
    name: 'Velodrome/Solidly CL',
    factory: '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F',
    // v2.3: Velodrome launched 2022 — 2M blocks sufficient; uses callView not event scan
    maxScanBlocks: 2_000_000,
    detect: async (chain) => {
      const factory = '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F'
      const code = await getCode(chain, factory)
      if (code == null || code.length <= 4) return null
      const count = await callView(chain, factory, 'function allPoolsLength() view returns (uint256)')
      return { address: factory, pools: count != null ? Number(count) : null }
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F', 'velodrome', 'aerodrome')),
    stub: () => null,
  },

  'pancakeswap-v3': {
    name: 'PancakeSwap V3',
    factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    maxScanBlocks: 6_000_000,
    usesEventScan: true,
    detect: async (chain, maxBlocks, fromBlock = null, onScanned = null) => {
      const factory = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'
      const code = await getCode(chain, factory)
      if (code == null || code.length <= 4) return null
      const pools = await countEvents(chain, factory,
        '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118',
        maxBlocks, fromBlock, onScanned)
      return { address: factory, pools }
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865', 'pancakeswap')),
    stub: () => null,
  },

}

// ── Adapter coverage index ─────────────────────────────────────────────────

// Registries that DeFiLlama maintainers use as canonical "we already track
// this" sources.  Keeping these in sync with projects/*/index.js for coverage
// detection closes the duplicate-PR class of failure.  Born from 2026-04-29
// audit which revealed 7 of 11 campaign PRs were duplicates of
// registries/uniswapV3.js entries — Hercules V3 line 639, KittenSwap 944,
// QuickSwap V3 1092, Kodiak V3 1596, Lynex V2 14, plus 4 earlier closures.
const REGISTRY_FILES = [
  'registries/uniswapV3.js',  // Uniswap V3 + Algebra + Algebra forks
  'registries/balancer.js',   // Balancer V2 deployments
  'registries/aave.js',       // Aave V1/V2
  'registries/aaveV3.js',     // Aave V3
]

function buildAdapterIndex() {
  const root = path.join(__dirname, '..')
  const projectsDir = path.join(root, 'projects')
  const adapters = []

  // 1) Per-protocol adapters in projects/*/index.js
  for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (entry.name === 'helper') continue
    const indexPath = path.join(projectsDir, entry.name, 'index.js')
    if (!fs.existsSync(indexPath)) continue
    adapters.push({ name: entry.name, path: indexPath, kind: 'project' })
  }

  // 2) Canonical registry files — treated as synthetic adapters whose content
  //    is the full registry file.  The existing adapterCoversChain() and
  //    adapterMentions() regexes match registry entries the same way they
  //    match project files, so coverage detection is uniform across both.
  for (const rel of REGISTRY_FILES) {
    const abs = path.join(root, rel)
    if (!fs.existsSync(abs)) continue
    adapters.push({ name: `registry:${rel}`, path: abs, kind: 'registry' })
  }

  return adapters
}

const _contentCache = {}
function adapterContent(adapter) {
  if (!_contentCache[adapter.path]) {
    try { _contentCache[adapter.path] = fs.readFileSync(adapter.path, 'utf8') }
    catch { _contentCache[adapter.path] = '' }
  }
  return _contentCache[adapter.path]
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Fix: also match bare object key form  chain: { ... }
function adapterCoversChain(adapter, chain) {
  const content = adapterContent(adapter)
  const escaped = escapeRegExp(chain)
  return new RegExp(`(?:^|[\\s,{])(?:'${escaped}'|"${escaped}"|${escaped})\\s*:`, 'm').test(content)
}

function adapterMentions(adapter, ...keywords) {
  const content = adapterContent(adapter).toLowerCase()
  return keywords.some(k => content.includes(k.toLowerCase()))
}

// ── On-chain utilities ─────────────────────────────────────────────────────

async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

// Returns null on RPC failure (same sentinel pattern as countEvents/findFactoriesFromEvents).
async function getCode(chain, address) {
  try {
    const provider = sdk.getProvider(chain)
    const code = await withTimeout(provider.getCode(address), TIMEOUT_MS)
    return code || '0x'
  } catch (err) {
    console.warn(`  [warn] getCode ${chain} ${address.slice(0, 10)}: ${err.message}`)
    return null
  }
}

// Call a single view function on a contract. Returns null on any failure.
async function callView(chain, address, funcSig, args = []) {
  try {
    const { ethers } = require('ethers')
    const provider = sdk.getProvider(chain)
    const contract = new ethers.Contract(address, [funcSig], provider)
    const nameMatch = funcSig.match(/function\s+(\w+)/)
    if (!nameMatch) return null
    const fn = contract[nameMatch[1]]
    const result = await withTimeout(fn(...args), TIMEOUT_MS)
    return result
  } catch (err) {
    return null
  }
}

// Count events emitted from a specific address (last 2M blocks as proxy).
// fromBlockOverride: if provided, start scan here instead of (latest - maxBlocks).
// onScanned(latest): called with the toBlock once the scan completes — used by v2.4 cache.
// Returns null on RPC failure so callers can distinguish "no events" from "unknown".
async function countEvents(chain, address, topic, maxBlocks = 2_000_000, fromBlockOverride = null, onScanned = null) {
  try {
    const provider = sdk.getProvider(chain)
    const latest = await withTimeout(provider.getBlockNumber(), TIMEOUT_MS)
    onScanned?.(latest)
    const fromBlock = fromBlockOverride != null ? fromBlockOverride : Math.max(0, latest - maxBlocks)
    const logs = await withTimeout(
      provider.getLogs({ address, topics: [topic], fromBlock, toBlock: latest }),
      TIMEOUT_MS * 3,
    )
    return logs.length
  } catch (err) {
    console.warn(`  [warn] countEvents ${chain} ${address.slice(0, 10)}: ${err.message}`)
    return null
  }
}

// Find all addresses emitting a given topic (for dynamic factory discovery).
// Pages backward in chunks to catch old factories and survive provider log-limit failures.
// fromBlockOverride: explicit start block (v2.4 incremental scan).
// onScanned(latest): cache callback — receives the toBlock once scan starts.
// Returns null on outer failure so callers treat it as "unknown", not "not deployed".
async function findFactoriesFromEvents(chain, topic, maxBlocks = 4_000_000, chunkSize = 100_000, floorBlock = 0, fromBlockOverride = null, onScanned = null) {
  try {
    const provider = sdk.getProvider(chain)
    const latest = await withTimeout(provider.getBlockNumber(), TIMEOUT_MS)
    onScanned?.(latest)
    const bottomBlock = fromBlockOverride != null ? fromBlockOverride : Math.max(floorBlock, latest - maxBlocks)
    const counts = {}
    const samplePool = {} // factory address → one emitted pool address (from log.data)

    let toBlock = latest
    while (toBlock > bottomBlock) {
      const fromBlock = Math.max(bottomBlock, toBlock - chunkSize)
      let logs = null
      try {
        logs = await withTimeout(
          provider.getLogs({ topics: [topic], fromBlock, toBlock }),
          TIMEOUT_MS * 4,
        )
      } catch (chunkErr) {
        // On chunk failure, try each half independently before skipping the range
        const mid = Math.floor((fromBlock + toBlock) / 2)
        if (mid < toBlock) {
          let upper = null
          let lower = null
          try {
            upper = await withTimeout(
              provider.getLogs({ topics: [topic], fromBlock: mid + 1, toBlock }),
              TIMEOUT_MS * 4,
            )
          } catch { /* try lower half regardless */ }
          try {
            lower = await withTimeout(
              provider.getLogs({ topics: [topic], fromBlock, toBlock: mid }),
              TIMEOUT_MS * 4,
            )
          } catch { /* both halves failed */ }
          if (upper || lower) {
            logs = [...(upper || []), ...(lower || [])]
          } else {
            console.warn(`  [warn] findFactories ${chain} chunk [${fromBlock}-${toBlock}] skipped: ${chunkErr.message}`)
          }
        }
      }
      if (logs) {
        for (const log of logs) {
          counts[log.address] = (counts[log.address] || 0) + 1
          // Algebra Pool(token0, token1, pool): pool is the non-indexed 3rd param in log.data
          if (!samplePool[log.address] && log.data && log.data.length >= 42) {
            samplePool[log.address] = '0x' + log.data.slice(-40)
          }
        }
      }
      toBlock = fromBlock - 1
    }

    if (!Object.keys(counts).length) return []
    return Object.entries(counts).map(([address, pools]) => ({
      address,
      pools,
      samplePool: samplePool[address] || null,
    }))
  } catch (err) {
    console.warn(`  [warn] findFactories ${chain} topic ${topic.slice(0, 10)}: ${err.message}`)
    return null
  }
}

// ── DeFiLlama API coverage + chain TVL (v2.2) ─────────────────────────────
// DeFiLlama's internal adapter DB is larger than the public GitHub repo.
// A protocol can be tracked (appears in chainTvls) with no public adapter file.
// We fetch the live protocol list AND per-chain total TVL.
// v2.2: gaps are re-ranked by chain TVL (bigger chain → higher priority gap),
// with pool count as tiebreak.  A 35-pool factory on Ethereum ranks above a
// 200-pool factory on a $1M chain.

// Known mismatches between our chain slugs (EVM_CHAINS) and the 'name' field
// returned by api.llama.fi/v2/chains.
const CHAIN_SLUG_ALIASES = {
  'bsc':     ['bnb chain', 'binance smart chain', 'bsc'],
  'avax':    ['avalanche', 'avax'],
  'xdai':    ['gnosis', 'xdai'],
  'era':     ['zksync era', 'zksync', 'era'],
  'polygon': ['polygon', 'matic'],
  'metis':   ['metis andromeda', 'metis'],
  'aurora':  ['aurora'],
  'celo':    ['celo'],
  'rsk':     ['rootstock', 'rsk'],
  'moonbeam':['moonbeam'],
  'moonriver':['moonriver'],
}

/**
 * Fetch total USD TVL per chain from api.llama.fi/v2/chains.
 * @returns {Promise<Map<string,number>>} chain slug → TVL USD (empty Map on failure)
 */
async function fetchChainTvl() {
  return new Promise((resolve) => {
    const req = https.get('https://api.llama.fi/v2/chains', { timeout: 15000 }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          const entries = JSON.parse(Buffer.concat(chunks).toString())
          // Build nameMap: normalized-lowercase-name → tvl
          const nameMap = new Map()
          for (const e of entries) {
            const key = (e.name || '').toLowerCase().trim()
            if (e.tvl && key) nameMap.set(key, e.tvl)
          }
          // Map our EVM_CHAINS slugs → tvl via direct match then aliases
          const result = new Map()
          for (const slug of EVM_CHAINS) {
            if (nameMap.has(slug)) { result.set(slug, nameMap.get(slug)); continue }
            const aliases = CHAIN_SLUG_ALIASES[slug] || []
            for (const alias of aliases) {
              if (nameMap.has(alias)) { result.set(slug, nameMap.get(alias)); break }
            }
          }
          resolve(result)
        } catch { resolve(new Map()) }
      })
    })
    req.on('error', () => resolve(new Map()))
    req.on('timeout', () => { req.destroy(); resolve(new Map()) })
  })
}

async function fetchLlamaCoverage() {
  return new Promise((resolve) => {
    const req = https.get('https://api.llama.fi/protocols', { timeout: 15000 }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          const protocols = JSON.parse(Buffer.concat(chunks).toString())
          // Build map: family-keyword → Set<chain>
          const coverage = {
            balancer:    new Set(),
            algebra:     new Set(),
            uniswapv3:   new Set(),
            aave:        new Set(),
            curve:       new Set(),
            velodrome:   new Set(),
            pancakeswap: new Set(),
          }
          for (const p of protocols) {
            const name = (p.name || '').toLowerCase()
            const slug = (p.slug || '').toLowerCase()
            const chains = Object.keys(p.chainTvls || {}).map(c => c.toLowerCase())
            const tag = (kw) => name.includes(kw) || slug.includes(kw)
            if (tag('balancer') || tag('beets') || tag('bex'))
              chains.forEach(c => coverage.balancer.add(c))
            if (tag('algebra') || tag('swapx') || tag('shadow') || tag('hercules'))
              chains.forEach(c => coverage.algebra.add(c))
            if (tag('uniswap v3') || tag('uniswapv3') || (tag('uniswap') && tag('v3')) || tag('uni-v3'))
              chains.forEach(c => coverage.uniswapv3.add(c))
            if (tag('aave'))
              chains.forEach(c => coverage.aave.add(c))
            if (tag('curve'))
              chains.forEach(c => coverage.curve.add(c))
            if (tag('velodrome') || tag('aerodrome') || tag('solidly'))
              chains.forEach(c => coverage.velodrome.add(c))
            if (tag('pancakeswap') || tag('pancake swap'))
              chains.forEach(c => coverage.pancakeswap.add(c))
          }
          resolve(coverage)
        } catch { resolve(null) }
      })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

// ── v2.5: Contract attribution via Blockscout V2 (keyless) ────────────────
// Primary: Blockscout /api/v2/smart-contracts/{address} — no API key needed.
// Fallback: Etherscan V2 — only used when ETHERSCAN_API_KEY env var is set.
// Returns null gracefully for unsupported chains — no attribution > wrong data.

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

// Blockscout V2 base URLs — no API key required, returns {name, is_verified, ...}
const CHAIN_BLOCKSCOUT = {
  ethereum:  'https://eth.blockscout.com',
  arbitrum:  'https://arbitrum.blockscout.com',
  optimism:  'https://optimism.blockscout.com',
  base:      'https://base.blockscout.com',
  polygon:   'https://polygon.blockscout.com',
  xdai:      'https://gnosis.blockscout.com',
  celo:      'https://celo.blockscout.com',
  scroll:    'https://scroll.blockscout.com',
  linea:     'https://explorer.linea.build',
  mode:      'https://explorer.mode.network',
  metis:     'https://andromeda-explorer.metis.io',
  kava:      'https://kavascan.com',
  aurora:    'https://explorer.aurora.dev',
  manta:     'https://manta-pacific.blockscout.com',
  // Only chains where the configured URL is an actual Blockscout V2 instance
  // exposing /api/v2/smart-contracts. Etherscan-style explorers (sonicscan.org,
  // fraxscan.com, taikoscan.io, bobascan.com, blastexplorer.io, cornscan.io,
  // explorer.zksync.io) silently return non-2xx on that path and fall through
  // to the Etherscan V2 path below when ETHERSCAN_API_KEY is set.
  unichain:  'https://unichain.blockscout.com',
  berachain: 'https://berachain.blockscout.com',
  ink:       'https://explorer.inkonchain.com',
  mantle:    'https://explorer.mantle.xyz',
}

// Etherscan V2 chain IDs — used when ETHERSCAN_API_KEY is set (covers chains without Blockscout)
const CHAIN_ETHERSCAN_ID = {
  ethereum: 1, arbitrum: 42161, optimism: 10, base: 8453, polygon: 137,
  avax: 43114, bsc: 56, linea: 59144, scroll: 534352, blast: 81457,
  mantle: 5000, xdai: 100, celo: 42220, cronos: 25, moonbeam: 1284,
  moonriver: 1285, fraxtal: 252, taiko: 167000, metis: 1088, mode: 34443,
  sonic: 146, era: 324, kava: 2222,
}

/**
 * Fetch contract name from Blockscout V2 (keyless).
 * @param {string} baseUrl - Blockscout base URL for the chain
 * @param {string} address
 * @returns {Promise<{name:string,verified:boolean}|null>}
 */
function _fetchBlockscout(baseUrl, address) {
  return new Promise((resolve) => {
    const url = `${baseUrl}/api/v2/smart-contracts/${address}`
    const req = https.get(url, { timeout: 8000 }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) return resolve(null)
          const body = JSON.parse(Buffer.concat(chunks).toString())
          const name = body.name || null
          if (!name) return resolve(null)
          resolve({ name, verified: body.is_verified === true })
        } catch { resolve(null) }
      })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

/**
 * Fetch contract name from Etherscan V2 (requires ETHERSCAN_API_KEY).
 * @param {number} chainId
 * @param {string} address
 * @returns {Promise<{name:string,verified:boolean}|null>}
 */
function _fetchEtherscan(chainId, address) {
  return new Promise((resolve) => {
    const qs = new URLSearchParams({
      chainid: String(chainId), module: 'contract',
      action: 'getsourcecode', address, apikey: ETHERSCAN_API_KEY,
    })
    const req = https.get(`https://api.etherscan.io/v2/api?${qs}`, { timeout: 8000 }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString())
          if (body.status !== '1' || !body.result?.[0]) return resolve(null)
          const name = body.result[0].ContractName || null
          resolve(name ? { name, verified: true } : null)
        } catch { resolve(null) }
      })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

/**
 * Fetch contract attribution for a factory address.
 * Tries Blockscout V2 first (keyless), then Etherscan V2 if API key is set.
 * @param {string} chain
 * @param {string} address
 * @returns {Promise<{name:string,verified:boolean}|null>}
 */
async function fetchAttribution(chain, address) {
  const bsBase = CHAIN_BLOCKSCOUT[chain]
  if (bsBase) {
    const result = await _fetchBlockscout(bsBase, address)
    if (result) return result
  }
  if (ETHERSCAN_API_KEY) {
    const chainId = CHAIN_ETHERSCAN_ID[chain]
    if (chainId) return _fetchEtherscan(chainId, address)
  }
  return null
}

/**
 * Get attribution for an address, using the persistent cache (lazy fetch).
 * Stores null for failed lookups so we never retry the same address twice.
 * @param {string} chain
 * @param {string} address
 * @param {Object} cache - the live cache object (mutated in place)
 * @returns {Promise<{name:string,verified:boolean}|null>}
 */
async function getAttribution(chain, address, cache) {
  if (!cache.attribution) cache.attribution = {}
  if (Object.prototype.hasOwnProperty.call(cache.attribution, address)) {
    return cache.attribution[address]  // null means already tried and failed
  }
  const result = await fetchAttribution(chain, address)
  cache.attribution[address] = result
  return result
}

// ── Chain list ─────────────────────────────────────────────────────────────

// EVM-only chains with a known RPC in the @defillama/sdk provider registry.
// To add a new chain: verify sdk.getProvider(chain) returns a working provider,
// then append the chain slug here. Slugs come from DefiLlama's chain registry
// (see https://github.com/DefiLlama/chainlist or sdk/src/providers.js).
const EVM_CHAINS = [
  'ethereum','arbitrum','optimism','base','polygon','avax','bsc','era','linea',
  'scroll','blast','mantle','mode','fraxtal','berachain','sonic','taiko','celo',
  'xdai','metis','aurora','kava','klaytn','cronos','moonbeam','moonriver',
  'boba','rsk','telos','meter','xdc','iotaevm','lisk','wc','corn','bob',
  'soneium','unichain','ink','swellchain','manta','xlayer','hemi','plasma',
  'abstract','megaeth','monad','hyperliquid','plume_mainnet','sseed','etlk',
  'lightlink_phoenix','goat','zklink','tempo','lens','rbn',
]

function resolveChains() {
  if (CHAINS_ARG === 'all') return EVM_CHAINS
  return CHAINS_ARG.split(',').map(c => c.trim()).filter(Boolean)
}

function resolveFamilies() {
  if (FAMILIES_ARG === 'all') return Object.keys(FAMILIES)
  return FAMILIES_ARG.split(',').map(f => f.trim()).filter(Boolean)
}

// ── Main ───────────────────────────────────────────────────────────────────

// Family key → keyword used in fetchLlamaCoverage coverage map
const FAMILY_LLAMA_KEY = {
  'balancer-v2':    'balancer',
  'algebra':        'algebra',
  'uniswap-v3':     'uniswapv3',
  'aave-v3':        'aave',
  'curve':          'curve',
  'velodrome-cl':   'velodrome',
  'pancakeswap-v3': 'pancakeswap',
}

// ── v2.4: Incremental JSON cache ───────────────────────────────────────────
// Stores per-(chain × family) scan progress and accumulated factory discoveries.
// Only event-scanning families (usesEventScan: true) update scan state.
// Coverage is re-evaluated fresh each run — merged adapters auto-close gaps.
const CACHE_VERSION = 1
const CACHE_PATH = path.join(__dirname, '..', 'data', 'drift_scanner_cache.json')

function loadCache() {
  if (FULL_RESCAN) {
    console.log('  [cache] --full-rescan: ignoring existing cache')
    return { version: CACHE_VERSION, scanState: {}, factories: {} }
  }
  try {
    if (!fs.existsSync(CACHE_PATH)) return { version: CACHE_VERSION, scanState: {}, factories: {} }
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    if (raw.version !== CACHE_VERSION) {
      console.warn('  [cache] version mismatch — starting fresh')
      return { version: CACHE_VERSION, scanState: {}, factories: {} }
    }
    const stateKeys = Object.keys(raw.scanState ?? {}).length
    const factoryCount = Object.values(raw.factories ?? {}).reduce((n, m) => n + Object.keys(m).length, 0)
    console.log(`  [cache] ${stateKeys} scan entries, ${factoryCount} known factories`)
    return raw
  } catch (err) {
    console.warn(`  [cache] load failed: ${err.message} — starting fresh`)
    return { version: CACHE_VERSION, scanState: {}, factories: {} }
  }
}

function saveCache(cache) {
  try {
    const dir = path.dirname(CACHE_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const tmp = CACHE_PATH + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 2))
    fs.renameSync(tmp, CACHE_PATH)
    const stateKeys = Object.keys(cache.scanState ?? {}).length
    const factoryCount = Object.values(cache.factories ?? {}).reduce((n, m) => n + Object.keys(m).length, 0)
    console.log(`  [cache] saved ${stateKeys} entries, ${factoryCount} factories → ${path.relative(process.cwd(), CACHE_PATH)}`)
  } catch (err) {
    console.warn(`  [cache] save failed: ${err.message}`)
  }
}

async function main() {
  const chains  = resolveChains()
  const familyKeys = resolveFamilies()
  const adapters = buildAdapterIndex()

  // v2.4: load incremental cache before any scanning
  const cache = loadCache()

  process.stdout.write('Fetching DeFiLlama coverage + chain TVL...')
  const [llamaCoverage, chainTvlMap] = await Promise.all([
    fetchLlamaCoverage(),
    fetchChainTvl(),
  ])
  console.log(` coverage=${llamaCoverage ? 'ok' : 'failed'} chains=${chainTvlMap.size}`)

  console.log(`\nDeFiLlama Drift Scanner`)
  console.log(`═══════════════════════════════════════════════════════`)
  console.log(`Chains:   ${chains.length}  |  Families: ${familyKeys.join(', ')}`)
  console.log(`Adapters: ${adapters.length} existing  |  Concurrency: ${CONCURRENCY}`)
  if (MAX_BLOCKS_OVERRIDE) console.log(`MaxBlocks override: ${MAX_BLOCKS_OVERRIDE.toLocaleString()} (--max-blocks)`)
  if (FULL_RESCAN) console.log(`Mode: full rescan (--full-rescan)`)
  else {
    const cachedChains = new Set(Object.keys(cache.scanState).map(k => k.split(':')[0])).size
    if (cachedChains > 0)
      console.log(`Cache: incremental — ${cachedChains} chains with prior scan state`)
  }
  console.log(`═══════════════════════════════════════════════════════\n`)

  const tasks = []
  for (const chain of chains) {
    for (const familyKey of familyKeys) {
      const family = FAMILIES[familyKey]
      if (!family) { console.warn(`Unknown family: ${familyKey}`); continue }
      const effectiveMaxBlocks = MAX_BLOCKS_OVERRIDE ?? family.maxScanBlocks ?? 4_000_000
      const cacheKey = `${chain}:${familyKey}`
      tasks.push(async () => {
        try {
          // v2.4: incremental fromBlock — only scan new blocks since last run
          const cachedScan = cache.scanState[cacheKey]
          const fromBlock = (family.usesEventScan && !FULL_RESCAN && cachedScan?.lastBlock != null)
            ? cachedScan.lastBlock + 1
            : null  // null → full window via maxScanBlocks

          // onScanned fires with `latest` the first time a block-number fetch succeeds.
          // Used to update scanState without an extra RPC call.
          let scannedToBlock = null
          const onScanned = (latest) => { if (scannedToBlock == null) scannedToBlock = latest }

          const detected = await family.detect(chain, effectiveMaxBlocks, fromBlock, onScanned)

          // v2.4: merge newly discovered factories into persistent cache
          if (family.usesEventScan && scannedToBlock != null) {
            const now = new Date().toISOString()
            cache.scanState[cacheKey] = { lastBlock: scannedToBlock, lastRunTs: now }
            if (detected) {
              if (!cache.factories[cacheKey]) cache.factories[cacheKey] = {}
              const newInfos = Array.isArray(detected) ? detected : [detected]
              for (const f of newInfos) {
                const prev = cache.factories[cacheKey][f.address]
                cache.factories[cacheKey][f.address] = {
                  firstSeen: prev?.firstSeen ?? now,
                  // Incremental scans return only the delta in [fromBlock, latest],
                  // so accumulate. --full-rescan clears the cache, making prev
                  // undefined; the addition is safe in both paths.
                  pools: (prev?.pools ?? 0) + (f.pools ?? 0),
                  samplePool: f.samplePool ?? prev?.samplePool ?? null,
                }
              }
            }
          }

          // For event-scanning families: evaluate ALL cached factories (not just new ones).
          // This ensures factories from previous runs continue to surface as gaps until covered.
          // For non-event families (aave-v3, curve, velodrome-cl): use raw detect result.
          let allInfos
          if (family.usesEventScan) {
            allInfos = Object.entries(cache.factories[cacheKey] ?? {})
              .map(([address, meta]) => ({ address, pools: meta.pools, samplePool: meta.samplePool }))
          } else {
            if (!detected) return []
            allInfos = Array.isArray(detected) ? detected : [detected]
          }

          if (!allInfos.length) return []

          const chainTvlUsd = chainTvlMap.get(chain.toLowerCase()) ?? 0
          const llamaKey = FAMILY_LLAMA_KEY[familyKey]
          const apiCovered = llamaCoverage && llamaKey && familyKey !== 'algebra'
            ? llamaCoverage[llamaKey].has(chain.toLowerCase())
            : false

          return allInfos.map(info => {
            const localCovered = familyKey === 'algebra'
              ? family.coveredBy(chain, info, adapters)
              : family.coveredBy(chain, adapters)
            const covered = localCovered || apiCovered
            return { chain, familyKey, family: family.name, info, covered, apiCovered, chainTvlUsd }
          })
        } catch (err) {
          console.warn(`  [warn] detect ${familyKey}/${chain}: ${err.message}`)
          return []
        }
      })
    }
  }

  process.stdout.write(`Scanning ${tasks.length} (chain × family) pairs`)
  let done = 0
  const tick = setInterval(() => process.stdout.write('.'), 2000)

  const limit = pLimit(CONCURRENCY)
  const raw = await Promise.all(tasks.map(t => limit(t)))
  clearInterval(tick)
  console.log(' done.\n')

  const deployed = raw.flat().filter(Boolean)
  const gaps     = deployed.filter(r => !r.covered)
    .sort((a, b) => {
      // v2.2: primary rank by chain TVL descending (bigger chain = higher-priority gap)
      const tvlDiff = (b.chainTvlUsd ?? 0) - (a.chainTvlUsd ?? 0)
      if (tvlDiff !== 0) return tvlDiff
      // Tiebreak: pool count descending
      return (b.info.pools ?? -1) - (a.info.pools ?? -1)
    })
    .slice(0, TOP)

  // ── Report ───────────────────────────────────────────────────────────────
  function fmtUsd(n) {
    if (!n) return '       ?'
    if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`.padStart(8)
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`.padStart(8)
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`.padStart(8)
    if (n >= 1e3)  return `$${(n / 1e3).toFixed(0)}K`.padStart(8)
    return `$${n.toFixed(0)}`.padStart(8)
  }

  if (!MAX_BLOCKS_OVERRIDE) {
    const windows = familyKeys.map(k => {
      const mb = (FAMILIES[k]?.maxScanBlocks ?? 4_000_000) / 1_000_000
      return `${k}=${mb}M`
    }).join('  ')
    console.log(`Scan windows (blocks): ${windows}`)
  }

  // v2.5: pre-fetch attributions for all gaps in parallel (lazy-cached per address)
  process.stdout.write(`Attributing ${gaps.length} factory addresses...`)
  const gapAttrs = await Promise.all(gaps.map(g => getAttribution(g.chain, g.info.address, cache)))
  const attrHits = gapAttrs.filter(Boolean).length
  console.log(` ${attrHits}/${gaps.length} resolved`)

  console.log(`DEPLOYED BUT UNCOVERED — Top ${gaps.length} gaps ranked by chain TVL`)
  console.log(`${'Chain'.padEnd(18)} ${'Family'.padEnd(18)} ${'ChainTVL'.padStart(9)} ${'Pools'.padStart(6)}  Address`)
  console.log('─'.repeat(82))
  for (let i = 0; i < gaps.length; i++) {
    const g    = gaps[i]
    const attr = gapAttrs[i]
    const pools = g.info.pools == null ? '     ?' : String(g.info.pools).padStart(6)
    const tvl   = fmtUsd(g.chainTvlUsd)
    const addr  = g.info.address.slice(0, 42)
    const label = attr?.name ? `  (${attr.name})` : ''
    console.log(`${g.chain.padEnd(18)} ${g.family.padEnd(18)} ${tvl} ${pools}  ${addr}${label}`)
  }

  const covered    = deployed.filter(r => r.covered)
  const apiBlocked = covered.filter(r => r.apiCovered)
  console.log(`\nAlready covered: ${covered.length} / ${deployed.length} detected deployments`)
  if (apiBlocked.length)
    console.log(`  (${apiBlocked.length} blocked by DeFiLlama API — not in local adapters but tracked internally)`)
  console.log(`Gaps found:      ${gaps.length}`)

  // ── Stub generation ──────────────────────────────────────────────────────
  if (GEN_STUBS && gaps.length) {
    console.log(`\nGenerating adapter stubs...`)
    for (const g of gaps) {
      const family = FAMILIES[g.familyKey]
      const stubResult = family.stub(g.chain, g.info)
      if (!stubResult) {
        console.log(`  skipped ${g.family}/${g.chain} (shared adapter — edit existing project manually)`)
        continue
      }
      const { slug, code } = stubResult
      // Reject anything that isn't a plain adapter slug — defends against
      // path traversal via crafted --chains values feeding into family.stub().
      if (!/^[a-z0-9][a-z0-9_-]*$/i.test(slug) || slug.length > 64) {
        console.warn(`  skipped ${g.family}/${g.chain} (invalid slug: ${slug})`)
        continue
      }
      const projectsRoot = path.resolve(__dirname, '..', 'projects')
      const dir  = path.resolve(projectsRoot, slug)
      const file = path.join(dir, 'index.js')
      if (!dir.startsWith(projectsRoot + path.sep)) {
        console.warn(`  skipped ${g.family}/${g.chain} (slug escapes projects/)`)
        continue
      }
      if (fs.existsSync(file)) {
        console.warn(`  skipped projects/${slug}/index.js (already exists)`)
        continue
      }
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, code)
      console.log(`  wrote projects/${slug}/index.js`)
    }
  }

  if (JSON_OUT) {
    const report = {
      timestamp: new Date().toISOString(),
      gaps: gaps.map((g, i) => ({
        chain: g.chain,
        family: g.family,
        pools: g.info.pools ?? null,
        chainTvlUsd: g.chainTvlUsd ?? null,
        address: g.info.address,
        contractName: gapAttrs[i]?.name ?? null,
      })),
      summary: {
        covered: covered.length,
        total: deployed.length,
        apiBlocked: apiBlocked.length,
        gapsFound: gaps.length,
      },
    }
    fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2))
    console.log(`\nJSON report written to ${JSON_OUT}`)
  }

  // v2.4: persist incremental cache so next run only scans new blocks
  saveCache(cache)

  console.log('\nDone.\n')
}

main().catch(err => {
  console.error('\nFATAL:', err.message)
  process.exit(1)
})
