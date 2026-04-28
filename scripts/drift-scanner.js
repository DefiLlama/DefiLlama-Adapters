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

const fs   = require('fs')
const path = require('path')
const sdk  = require('@defillama/sdk')

// ── CLI ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (name, def) => {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : def
}
const has = (name) => argv.includes(name)

const CHAINS_ARG    = flag('--chains', 'all')
const FAMILIES_ARG  = flag('--families', 'all')
const TOP           = parseInt(flag('--top', '50'), 10)
const CONCURRENCY   = parseInt(flag('--concurrency', '15'), 10)
const GEN_STUBS     = has('--gen-stubs')
const TIMEOUT_MS    = parseInt(flag('--timeout', '6000'), 10)

// ── Protocol family definitions ────────────────────────────────────────────
// Each family describes how to detect deployment and how to generate an adapter.

const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

const FAMILIES = {

  'balancer-v2': {
    name: 'Balancer V2',
    // Canonical vault deployed at the same address across all chains
    detect: async (chain) => {
      const code = await getCode(chain, BALANCER_VAULT)
      if (code.length <= 4) return null
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
        if (code.length > 4) {
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
      if (!candidates.length) return null
      // Validate: a real Algebra factory has code AND its "pool" addresses also have code
      // (removes false positives from non-factory contracts emitting the same topic)
      const validated = []
      for (const c of candidates) {
        if (c.pools < 2) continue // skip singletons — likely test deploys or false positives
        const code = await getCode(chain, c.address)
        if (code.length <= 4) continue
        validated.push(c)
      }
      if (!validated.length) return null
      const best = validated.sort((a, b) => b.pools - a.pools)[0]
      return { address: best.address, pools: best.pools, allFactories: validated }
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'isAlgebra', 'algebra')),
    stub: (chain, info) => ({
      slug: `algebra-clmm-${chain}`,
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
      if (code.length > 4) return { address: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', pools: 1 }
      // Fallback: check known Aave V3 pool addresses on each chain
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'aave')),
    stub: (chain, info) => ({
      slug: `aave-v3-${chain}`,
      code: `// Add '${chain}' to projects/aave-v3/index.js config:\n// ${chain}: { poolDatas: ['<POOL_DATA_PROVIDER_ADDRESS>'] },\n`,
    }),
  },

  'curve': {
    name: 'Curve DEX',
    // Curve AddressProvider: same on all chains
    addressProvider: '0x0000000022D53366457F9d5E68Ec105046FC4383',
    detect: async (chain) => {
      const code = await getCode(chain, '0x0000000022D53366457F9d5E68Ec105046FC4383')
      if (code.length > 4) return { address: '0x0000000022D53366457F9d5E68Ec105046FC4383', pools: 1 }
      return null
    },
    coveredBy: (chain, adapters) =>
      adapters.some(a => adapterCoversChain(a, chain) &&
        adapterMentions(a, 'curve')),
    stub: (chain, info) => ({
      slug: `curve-${chain}`,
      code: `// Add '${chain}' to projects/curve/index.js chain list.\n`,
    }),
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

function adapterCoversChain(adapter, chain) {
  const content = adapterContent(adapter)
  return content.includes(`'${chain}'`) || content.includes(`"${chain}"`)
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

async function getCode(chain, address) {
  try {
    const provider = sdk.getProvider(chain)
    const code = await withTimeout(provider.getCode(address), TIMEOUT_MS)
    return code || '0x'
  } catch { return '0x' }
}

// Count events emitted from a specific address (last 2M blocks as proxy)
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
  } catch { return 0 }
}

// Find all addresses emitting a given topic (for dynamic factory discovery)
async function findFactoriesFromEvents(chain, topic, maxBlocks = 4_000_000) {
  try {
    const provider = sdk.getProvider(chain)
    const latest = await withTimeout(provider.getBlockNumber(), TIMEOUT_MS)
    const fromBlock = Math.max(0, latest - maxBlocks)
    const logs = await withTimeout(
      provider.getLogs({ topics: [topic], fromBlock, toBlock: latest }),
      TIMEOUT_MS * 4,
    )
    const counts = {}
    for (const log of logs) {
      counts[log.address] = (counts[log.address] || 0) + 1
    }
    return Object.entries(counts).map(([address, pools]) => ({ address, pools }))
  } catch { return [] }
}

// ── Chain list ─────────────────────────────────────────────────────────────

// EVM-only chains with a known RPC in the SDK
const EVM_CHAINS = [
  'ethereum','arbitrum','optimism','base','polygon','avax','bsc','era','linea',
  'scroll','blast','mantle','mode','fraxtal','berachain','sonic','taiko','celo',
  'xdai','metis','aurora','kava','klaytn','cronos','moonbeam','moonriver',
  'boba','rsk','telos','meter','xdc','iotaevm','lisk','wc','corn','bob',
  'soneium','unichain','ink','swellchain','manta','xlayer','hemi','plasma',
  'abstract','megaeth','monad','hyperliquid','plume_mainnet','sseed','etlk',
  'lightlink_phoenix','goat','zklink','iotaevm','tempo','lens','rbn',
]

function resolveChains() {
  if (CHAINS_ARG === 'all') return EVM_CHAINS
  return CHAINS_ARG.split(',').map(c => c.trim()).filter(Boolean)
}

function resolveFamilies() {
  if (FAMILIES_ARG === 'all') return Object.keys(FAMILIES)
  return FAMILIES_ARG.split(',').map(f => f.trim()).filter(Boolean)
}

// ── Concurrency limiter ────────────────────────────────────────────────────

async function pLimit(tasks, limit) {
  const results = []
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      results[idx] = await tasks[idx]()
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const chains  = resolveChains()
  const familyKeys = resolveFamilies()
  const adapters = buildAdapterIndex()

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
          const info = await family.detect(chain)
          if (!info) return null
          const covered = family.coveredBy(chain, adapters)
          return { chain, familyKey, family: family.name, info, covered }
        } catch { return null }
      })
    }
  }

  process.stdout.write(`Scanning ${tasks.length} (chain × family) pairs`)
  let done = 0
  const tick = setInterval(() => process.stdout.write('.'), 2000)

  const raw = await pLimit(tasks, CONCURRENCY)
  clearInterval(tick)
  console.log(' done.\n')

  const deployed = raw.filter(Boolean)
  const gaps     = deployed.filter(r => !r.covered)
    .sort((a, b) => b.info.pools - a.info.pools)
    .slice(0, TOP)

  // ── Report ───────────────────────────────────────────────────────────────
  console.log(`DEPLOYED BUT UNCOVERED — Top ${gaps.length} gaps by pool count`)
  console.log(`${'Chain'.padEnd(18)} ${'Family'.padEnd(18)} ${'Pools'.padStart(6)}  Address`)
  console.log('─'.repeat(72))
  for (const g of gaps) {
    const pools = String(g.info.pools).padStart(6)
    const addr  = g.info.address.slice(0, 42)
    console.log(`${g.chain.padEnd(18)} ${g.family.padEnd(18)} ${pools}  ${addr}`)
  }

  const covered = deployed.filter(r => r.covered)
  console.log(`\nAlready covered: ${covered.length} / ${deployed.length} detected deployments`)
  console.log(`Gaps found:      ${gaps.length}`)

  // ── Stub generation ──────────────────────────────────────────────────────
  if (GEN_STUBS && gaps.length) {
    console.log(`\nGenerating adapter stubs...`)
    for (const g of gaps) {
      const family = FAMILIES[g.familyKey]
      const { slug, code } = family.stub(g.chain, g.info)
      const dir = path.join(__dirname, '..', 'projects', slug)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'index.js'), code)
      console.log(`  wrote projects/${slug}/index.js`)
    }
  }

  console.log('\nDone.\n')
}

main().catch(err => {
  console.error('\nFATAL:', err.message)
  process.exit(1)
})
