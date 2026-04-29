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

const CHAINS_ARG    = flag('--chains', 'all')
const FAMILIES_ARG  = flag('--families', 'all')
const TOP           = parseIntFlag('--top', 50, { min: 0 })
const CONCURRENCY   = parseIntFlag('--concurrency', 15, { min: 1 })
const GEN_STUBS     = has('--gen-stubs')
const TIMEOUT_MS    = parseIntFlag('--timeout', 6000, { min: 1 })
const JSON_OUT      = flag('--json', null)   // path to write structured gap report

// ── Protocol family definitions ────────────────────────────────────────────
// Each family describes how to detect deployment and how to generate an adapter.

const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

const FAMILIES = {

  'balancer-v2': {
    name: 'Balancer V2',
    // Canonical vault deployed at the same address across all chains
    detect: async (chain) => {
      const code = await getCode(chain, BALANCER_VAULT)
      if (code == null || code.length <= 4) return null
      // Count registered pools via PoolRegistered event to estimate scale
      const pools = await countEvents(chain, BALANCER_VAULT,
        '0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e')
      return { address: BALANCER_VAULT, pools }
    },
    // Checks the adapter covers this chain
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, BALANCER_VAULT, 'onChainTvl', 'balancer')),
    // Generate one-liner adapter
    stub: (chain, info) => ({
      slug: `balancer-${chain}`,
      code: `'use strict'\nconst { onChainTvl } = require('../helper/balancer')\nmodule.exports = {\n  timetravel: false,\n  ${chain}: { tvl: onChainTvl('${BALANCER_VAULT}', 0) },\n}\n`,
    }),
  },

  'uniswap-v3': {
    name: 'Uniswap V3',
    // Two known canonical factory addresses
    factories: [
      '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
    ],
    poolTopic: '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118',
    detect: async function(chain) {
      for (const factory of this.factories) {
        const code = await getCode(chain, factory)
        if (code != null && code.length > 4) {
          const pools = await countEvents(chain, factory, this.poolTopic)
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
    // Algebra Factory emits Pool(token0, token1, pool)
    poolTopic: '0x91ccaa7a278130b65168c3a0c8d3bcae84cf5e43704342bd3ec0b59e59c036db',
    detect: async function(chain) {
      const candidates = await findFactoriesFromEvents(chain, this.poolTopic)
      if (!candidates || !candidates.length) return null
      // Validate: a real Algebra factory has code AND at least one emitted pool has code
      // (removes false positives from non-factory contracts emitting the same topic)
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
      // Return all validated factories so multi-factory chains each get a gap entry
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
    // PoolAddressesProvider factory: same across chains
    providerFactory: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    // Aave V3 Pool implementation fingerprint (getReservesList selector)
    poolSelector: '0xd1946dbc',
    detect: async (chain) => {
      const code = await getCode(chain, '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e')
      if (code != null && code.length > 4) return { address: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', pools: 1 }
      // Fallback: check known Aave V3 pool addresses on each chain
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'aave')),
    stub: () => null, // Aave V3 is a shared adapter — add chain to projects/aave-v3/index.js, not a new directory
  },

  'curve': {
    name: 'Curve DEX',
    // Curve AddressProvider: same on all chains
    addressProvider: '0x0000000022D53366457F9d5E68Ec105046FC4383',
    detect: async (chain) => {
      const code = await getCode(chain, '0x0000000022D53366457F9d5E68Ec105046FC4383')
      if (code != null && code.length > 4) return { address: '0x0000000022D53366457F9d5E68Ec105046FC4383', pools: 1 }
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'curve')),
    stub: () => null, // Curve is a shared adapter — add chain to projects/curve/index.js, not a new directory
  },


  'velodrome-cl': {
    name: 'Velodrome/Solidly CL',
    // Standard CL factory address used by Velodrome and most Solidly forks
    factory: '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F',
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
    stub: () => null, // add chain to projects/velodrome-CL/index.js
  },

  'pancakeswap-v3': {
    name: 'PancakeSwap V3',
    // Standard V3 factory — same address across BSC, Ethereum, Arbitrum, Base, etc.
    factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    detect: async (chain) => {
      const factory = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'
      const code = await getCode(chain, factory)
      if (code == null || code.length <= 4) return null
      // Count via PoolCreated event topic (same as Uniswap V3)
      const pools = await countEvents(chain, factory,
        '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118')
      return { address: factory, pools }
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865', 'pancakeswap')),
    stub: () => null, // add chain to projects/pancakeswap-v3/index.js
  },

}

// ── Adapter coverage index ─────────────────────────────────────────────────

function buildAdapterIndex() {
  const projectsDir = path.join(__dirname, '..', 'projects')
  const adapters = []
  for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (entry.name === 'helper') continue
    const indexPath = path.join(projectsDir, entry.name, 'index.js')
    if (!fs.existsSync(indexPath)) continue
    adapters.push({ name: entry.name, path: indexPath })
  }
  // Cache file content for mention checks (read lazily)
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
// Returns null on RPC failure so callers can distinguish "no events" from "unknown".
async function countEvents(chain, address, topic, maxBlocks = 2_000_000) {
  try {
    const provider = sdk.getProvider(chain)
    const latest = await withTimeout(provider.getBlockNumber(), TIMEOUT_MS)
    const fromBlock = Math.max(0, latest - maxBlocks)
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
// Returns null on outer failure so callers treat it as "unknown", not "not deployed".
async function findFactoriesFromEvents(chain, topic, maxBlocks = 4_000_000, chunkSize = 100_000, floorBlock = 0) {
  try {
    const provider = sdk.getProvider(chain)
    const latest = await withTimeout(provider.getBlockNumber(), TIMEOUT_MS)
    const bottomBlock = Math.max(floorBlock, latest - maxBlocks)
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

// ── DeFiLlama API coverage (prevents submitting already-tracked protocols) ──
// DeFiLlama's internal adapter DB is larger than the public GitHub repo.
// A protocol can be tracked (appears in chainTvls) with no public adapter file.
// We fetch the live protocol list and build a Set<chain> per protocol family.

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

async function main() {
  const chains  = resolveChains()
  const familyKeys = resolveFamilies()
  const adapters = buildAdapterIndex()

  process.stdout.write('Fetching DeFiLlama API coverage...')
  const llamaCoverage = await fetchLlamaCoverage()
  console.log(llamaCoverage ? ' ok' : ' failed (will rely on local adapter scan only)')

  console.log(`\nDeFiLlama Drift Scanner`)
  console.log(`═══════════════════════════════════════════════════════`)
  console.log(`Chains:   ${chains.length}  |  Families: ${familyKeys.join(', ')}`)
  console.log(`Adapters: ${adapters.length} existing  |  Concurrency: ${CONCURRENCY}`)
  console.log(`═══════════════════════════════════════════════════════\n`)

  const tasks = []
  for (const chain of chains) {
    for (const familyKey of familyKeys) {
      const family = FAMILIES[familyKey]
      if (!family) { console.warn(`Unknown family: ${familyKey}`); continue }
      tasks.push(async () => {
        try {
          const detected = await family.detect(chain)
          if (!detected) return []
          // Algebra returns an array (one entry per factory); others return a single object
          const infos = Array.isArray(detected) ? detected : [detected]
          return infos.map(info => {
            // Algebra coveredBy takes (chain, info, adapters) to check per factory address
            const localCovered = familyKey === 'algebra'
              ? family.coveredBy(chain, info, adapters)
              : family.coveredBy(chain, adapters)
            const llamaKey = FAMILY_LLAMA_KEY[familyKey]
            // Algebra uses per-factory localCovered; chain-level API check would hide
            // uncovered factories when one is already tracked — skip it for algebra.
            const apiCovered = llamaCoverage && llamaKey && familyKey !== 'algebra'
              ? llamaCoverage[llamaKey].has(chain.toLowerCase())
              : false
            const covered = localCovered || apiCovered
            return { chain, familyKey, family: family.name, info, covered, apiCovered }
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
    .sort((a, b) => (b.info.pools ?? -1) - (a.info.pools ?? -1))
    .slice(0, TOP)

  // ── Report ───────────────────────────────────────────────────────────────
  console.log(`DEPLOYED BUT UNCOVERED — Top ${gaps.length} gaps by pool count`)
  console.log(`${'Chain'.padEnd(18)} ${'Family'.padEnd(18)} ${'Pools'.padStart(6)}  Address`)
  console.log('─'.repeat(72))
  for (const g of gaps) {
    const pools = g.info.pools == null ? '     ?' : String(g.info.pools).padStart(6)
    const addr  = g.info.address.slice(0, 42)
    console.log(`${g.chain.padEnd(18)} ${g.family.padEnd(18)} ${pools}  ${addr}`)
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
      gaps: gaps.map(g => ({
        chain: g.chain,
        family: g.family,
        pools: g.info.pools ?? null,
        address: g.info.address,
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

  console.log('\nDone.\n')
}

main().catch(err => {
  console.error('\nFATAL:', err.message)
  process.exit(1)
})
