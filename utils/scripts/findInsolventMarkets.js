/*
 * findInsolventMarkets.js - which lending markets should we skip right now.
 *
 *   aave      Aave v2 / v3 forks       per POOL        -> insolvent-markets/aave
 *   compound  Compound v2 / Comet      per COMPTROLLER -> insolvent-markets/compound
 *   morpho    Morpho Blue              per MARKET ID   -> insolvent-markets/morpho-blue
 *
 * Read from current chain state only - no borrower enumeration, no log scans. The one
 * exception is Morpho market enumeration, which has no on-chain list and comes from the
 * adapter's own warm log cache.
 *
 * Each family lives in its own IIFE below and shares nothing with the others except the
 * COMMON section: the cli, rpc plumbing, discovery scaffolding, and the store. Signals
 * that look alike across families are computed separately, because the accounting isn't.
 *
 *   node utils/scripts/findInsolventMarkets.js                    # all three
 *   node utils/scripts/findInsolventMarkets.js aave --chain bsc --protocol valas
 *   node utils/scripts/findInsolventMarkets.js morpho compound --no-write
 *
 * The merged list goes to the family's file in the R2 tvl-adapter-cache; stdout gets
 * this run's delta (--print dumps the merged list). One family prints its own document,
 * several print { aave: ..., compound: ..., morpho: ... }. Counts, and the entries the
 * adapters don't exclude yet, go to stderr.
 *
 * Positional args pick the families: aave | compound | morpho | all. The rest is FLAGS -
 * --chain and --protocol to narrow, --min-usd, --no-write, --print, --fresh. Thresholds
 * live in each family's DEFAULTS.
 *
 * `firstSeen` records when each entry was first flagged, beside the buckets rather than inside
 * them so entry values stay strings. An entry with no date predates the tracking, and
 * firstSeen.trackingSince marks that boundary. --fresh restamps everything, because a rebuild
 * has no prior to carry from - it clears history as well as stale entries.
 *
 * --backfill-firstseen digs the real onset of the morpho vault entries out of chain history
 * instead of stamping them with the run. Opt-in, fills only missing dates, safe to re-run.
 *
 * READ `firstSeen` AS "the earliest point we can show this entry was or became misvalued", not
 * as an exact start of wrong data. Four things produce it, and only the first is exact:
 *
 *   lostAssets onset   the vault booked a realized loss totalAssets still counts -> exact
 *   market onset       the MARKET's accounting turned fictional. Equals the start of wrong data
 *                      only if the vault already held it; a vault that deposited afterwards
 *                      carries a date earlier than its own damage
 *   position onset     the vault first supplied that market, used where the market carries only
 *                      an oracle signal and has no on-chain scalar to bisect. Equals the start
 *                      only if the market was already bad
 *   the run itself     no backfill, so this is when the detector noticed - an UPPER bound, the
 *                      one case where the truth is earlier rather than later
 *
 * The first three are lower bounds and the fourth an upper bound, so a "became bad after X"
 * filter over-includes rather than misses. `max(market onset, position onset)` would be the
 * exact quantity for the middle two; it is deliberately not computed.
 *
 * Adapters read what this writes, without re-scanning:
 *   const { getCache } = require('../helper/cache')
 *   const { insolvent, stuck } = await getCache('insolvent-markets', 'aave')
 */

require('dotenv').config()
require('../../projects/helper/env')

const fs = require('fs')
const path = require('path')
const sdk = require('@defillama/sdk')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const isAddress = (s) => typeof s === 'string' && /^0x[0-9a-fA-F]{40}$/.test(s)
const lc = (s) => s.toLowerCase()
const nowSec = () => Math.floor(Date.now() / 1000)

const fmtUsd = (n) => n == null ? 'n/a' : `$${Math.round(n).toLocaleString('en-US')}`
const fmtPct = (n) => n == null ? 'n/a' : `${(n * 100).toFixed(2)}%`
const fmtMult = (n) => `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}x`
const fmtSize = (usd, raw) => usd == null ? `${raw} raw` : fmtUsd(usd)

const io = { note: (msg) => process.stderr.write(`${msg}\n`) }

const FLAGS = {
  '--protocol': ['protocols', 'list', lc],
  '--chain': ['chains', 'list'],
  '--min-usd': ['minUsd', 'number'],
  '--no-write': ['noWrite', 'bool'],
  '--print': ['print', 'bool'],
  '--fresh': ['fresh', 'bool'],
  '--backfill-firstseen': ['backfillFirstSeen', 'bool'],
}

function parseArgs(argv) {
  const families = []
  const opts = { protocols: [], chains: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) { families.push(lc(arg)); continue }
    const spec = FLAGS[arg]
    if (!spec) { console.error(`Unknown flag ignored: ${arg}`); continue }
    const [key, kind, map = (v) => v] = spec
    if (kind === 'bool') { opts[key] = true; continue }
    const raw = argv[++i]
    if (raw == null) throw new Error(`${arg} needs a value`)
    if (kind === 'list') opts[key].push(map(raw))
    else opts[key] = Number(raw)
  }
  return { families, opts }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    for (;;) {
      const i = cursor++
      if (i >= items.length) return
      out[i] = await fn(items[i], i)
    }
  }))
  return out
}

const rpcMessage = (e) => /reading 'success'/.test(e.message || '')
  ? 'multicall failed - rpc unreachable or no multicall contract on this chain'
  : e.message

async function runScans({ targets, opts, scan, label, onError }) {
  let done = 0
  const results = await mapLimit(targets, opts.concurrency, async (t) => {
    let out
    for (let attempt = 0; ; attempt++) {
      try {
        out = await scan(t, opts)
        break
      } catch (e) {
        if (attempt >= opts.retries) { out = onError(t, rpcMessage(e)); break }
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
      }
    }
    process.stderr.write(`\r  ${++done}/${targets.length}  ${label(t)}`.padEnd(70))
    return out
  })
  process.stderr.write(`\r${' '.repeat(70)}\r`)
  return results
}

async function getPriceMap(chain, tokens) {
  const uniq = [...new Set(tokens.filter(Boolean).map(lc))]
  const out = {}
  for (let i = 0; i < uniq.length; i += 100) {
    const batch = uniq.slice(i, i + 100)
    const prices = await sdk.coins.getPrices(batch.map(t => `${chain}:${t}`), 'now').catch(() => ({}))
    for (const [key, v] of Object.entries(prices)) {
      if (!v || v.price == null) continue
      const addr = key.split(':')[1]
      if (addr) out[lc(addr)] = v
    }
  }
  return out
}

async function subCall(api, length, abi, entries) {
  const out = new Array(length).fill(null)
  if (!entries.length) return out
  const res = await api.multiCall({ abi, calls: entries.map(e => ({ target: e.target, params: e.params })), permitFailure: true })
  entries.forEach((e, k) => { out[e.i] = res[k] })
  return out
}

const PROJECTS_ROOT = path.join(__dirname, '..', '..', 'projects')
const IS_HELPER = /(^|[\\/])helper[\\/]/


const loading = { protocol: null }

function eachRegistryEntry(files, errors, visit) {
  const utils = require('../../registries/utils')
  const topLevelKeys = new Set(require('../../projects/helper/whitelistedExportKeys.json'))
  const collected = []

  const orig = utils.buildProtocolExports
  utils.buildProtocolExports = function (configs, fn) {
    collected.push(configs)
    return orig.call(this, configs, fn)
  }
  try {
    for (const file of files) {
      try {
        require(`../../registries/${file}`)
      } catch (e) {
        errors.push(`registries/${file}.js failed to load: ${e.message}`)
      }
    }
  } finally {
    utils.buildProtocolExports = orig
  }

  for (const configs of collected) {
    for (const [protocol, entry] of Object.entries(configs)) {
      for (const [key, value] of Object.entries(entry)) {
        if (topLevelKeys.has(key) || key === '_options') continue
        visit(protocol, key, value)
      }
    }
  }
}

const TAG = Symbol('insolvencyTarget')

function tagExport(value, target) {
  if (!target) return value
  if (typeof value === 'function') {
    value[TAG] = [...(value[TAG] || []), target]
  } else if (value && typeof value === 'object') {
    for (const key of ['tvl', 'borrowed']) if (typeof value[key] === 'function') tagExport(value[key], target)
  }
  return value
}

function walkTaggedExports(mod, found, depth = 0, chain = null) {
  if (!mod || typeof mod !== 'object' || depth > 3) return
  for (const [key, value] of Object.entries(mod)) {
    if (typeof value === 'function') {
      for (const t of value[TAG] || []) found.push({ target: t, chain })
    } else if (value && typeof value === 'object') {
      walkTaggedExports(value, found, depth + 1, depth === 0 ? key : chain)
    }
  }
}

function patchSumChainTvls() {
  const orig = sdk.util.sumChainTvls
  const set = (fn) => Object.defineProperty(sdk.util, 'sumChainTvls', { value: fn, writable: true, enumerable: true, configurable: true })
  set(function (fns) {
    const result = orig.call(this, fns)
    const tags = (fns || []).flatMap(f => (typeof f === 'function' && f[TAG]) || [])
    if (tags.length && typeof result === 'function') result[TAG] = tags
    return result
  })
  return () => set(orig)
}


function purgeAdapterModules() {
  for (const file of Object.keys(require.cache)) {
    if (!file.startsWith(PROJECTS_ROOT + path.sep) || IS_HELPER.test(file)) continue
    delete require.cache[file]
  }
}


function discoverFromAdapters({ match, stripComments, patch, covered = () => false, missing }, errors) {
  const captured = []
  const restore = patch(captured)
  try {
    purgeAdapterModules()

    const files = fs.readdirSync(PROJECTS_ROOT, { recursive: true })
      .filter(f => typeof f === 'string' && f.endsWith('.js') && !IS_HELPER.test(f))
      .map(f => path.join(PROJECTS_ROOT, f))

    for (const file of files) {
      let src
      try { src = fs.readFileSync(file, 'utf8') } catch (e) { continue }
      if (!match.test(stripComments ? src.replace(/^\s*\/\/.*$/gm, '') : src)) continue
      const dir = path.basename(path.dirname(file))
      const protocol = dir === 'projects' ? path.basename(file, '.js') : dir
      loading.protocol = protocol
      const before = captured.length
      let mod = null
      try { mod = require(file) } catch (e) { /* adapter load failures are non-fatal here */ }
      const found = []
      walkTaggedExports(mod, found)
      for (const { target, chain } of found) if (chain && !target.chain) target.chain = chain
      if (captured.length === before && !covered(protocol)) {
        errors.push(`${path.relative(path.join(PROJECTS_ROOT, '..'), file)}: ${missing}`)
      }
    }
  } finally {
    loading.protocol = null
    restore()
  }
  return captured
}


function groupTargets(discovered, opts, errors, { addressesOf, blank, merge }) {
  const map = new Map()
  for (const t of discovered) {
    if (!t.chain) {
      errors.push(`${t.protocol}: chain not determinable from the adapter - tried ${addressesOf(t).join(', ') || '(no address)'}`)
      continue
    }
    if (opts.chains.length && !opts.chains.includes(t.chain)) continue
    if (opts.protocols.length && !opts.protocols.some(p => lc(t.protocol).includes(p))) continue
    const key = `${t.protocol}|${t.chain}`
    if (!map.has(key)) map.set(key, { protocol: t.protocol, chain: t.chain, ...blank() })
    merge(map.get(key), t)
  }
  return [...map.values()]
}


function verdictSet() {
  const rows = new Map()
  return {
    add(chain, key, verdict, label, reason) {
      const k = `${chain}|${key}`
      if (!rows.has(k)) rows.set(k, { chain, key, insolvent: false, reasons: [] })
      const row = rows.get(k)
      row.insolvent = row.insolvent || verdict === 'INSOLVENT'
      row.reasons.push(label ? `${label}: ${reason}` : reason)
    },
    has(chain, key) { return rows.has(`${chain}|${key}`) },
    buckets() {
      const out = { insolvent: {}, stuck: {} }
      for (const row of [...rows.values()].sort((a, b) => a.chain.localeCompare(b.chain))) {
        const bucket = out[row.insolvent ? 'insolvent' : 'stuck']
        if (!bucket[row.chain]) bucket[row.chain] = {}
        bucket[row.chain][row.key] = row.reasons.join(' | ')
      }
      return out
    },
  }
}


const storeKey = (family) => `tvl-adapter-cache/cache/insolvent-markets/${family}.json`

function normalizePrior(prior, buckets) {
  for (const b of buckets) {
    if (!prior[b] || typeof prior[b] !== 'object') { prior[b] = {}; continue }
    for (const [chain, entries] of Object.entries(prior[b])) {
      if (Array.isArray(entries)) {
        prior[b][chain] = Object.fromEntries(entries.map(k => [lc(String(k)), 'imported, no reason recorded']))
        continue
      }
      if (!entries || typeof entries !== 'object') { delete prior[b][chain]; continue }
      for (const [key, v] of Object.entries(entries)) {
        if (typeof v !== 'string') entries[key] = (v && v.reason) || 'recorded by an earlier run'
      }
    }
  }
  normalizeFirstSeen(prior, buckets)
  return prior
}

// `firstSeen` sits beside the buckets rather than inside them, so entry values stay strings for
// anyone already reading them. A date that isn't a number is dropped rather than carried: the
// stamping below treats "no recorded date" as "predates tracking", which is the safe reading.
function normalizeFirstSeen(prior, buckets) {
  const seen = prior.firstSeen && typeof prior.firstSeen === 'object' ? prior.firstSeen : {}
  const out = {}
  if (typeof seen.trackingSince === 'number') out.trackingSince = seen.trackingSince
  for (const b of buckets) {
    if (!seen[b] || typeof seen[b] !== 'object') continue
    for (const [chain, entries] of Object.entries(seen[b])) {
      if (!entries || typeof entries !== 'object') continue
      for (const [key, ts] of Object.entries(entries)) {
        if (typeof ts !== 'number' || !Number.isFinite(ts)) continue
        if (!out[b]) out[b] = {}
        if (!out[b][chain]) out[b][chain] = {}
        out[b][chain][key] = ts
      }
    }
  }
  prior.firstSeen = out
}

async function loadPrior(family, buckets, opts) {
  const blank = () => Object.fromEntries(buckets.map(b => [b, {}]))
  if (opts.fresh) return blank()
  const stored = await sdk.cache.readCache(storeKey(family), { readFromR2Cache: true }).catch(() => null)
  return normalizePrior({ ...blank(), ...(stored || {}) }, buckets)
}

async function saveState(family, state) {
  const written = await sdk.cache.writeCache(storeKey(family), state)
  if (!written) throw new Error(`${storeKey(family)} not written - writeCache rejected the payload`)
  return `wrote ${written.length}B to ${storeKey(family)}`
}

function guardFresh(opts, family) {
  if (opts.fresh && !opts.noWrite && (opts.chains.length || opts.protocols.length)) {
    throw new Error(`${family}: --fresh with a --chain/--protocol filter would drop every market outside it from the stored state - add --no-write`)
  }
}

function mergeBuckets({ prior, run, buckets, monotonic, refreshReasons, wasReRead }) {
  const state = {}
  const delta = { added: {}, refreshed: {}, quiet: {}, retired: {}, promoted: {} }
  for (const b of buckets) {
    state[b] = {}
    delta.added[b] = {}
    delta.refreshed[b] = []
    delta.quiet[b] = []
    delta.retired[b] = {}
  }
  const at = (bucket, chain, key) => ((bucket || {})[chain] || {})[key]
  const now = nowSec()
  const seen = {}
  const setSeen = (b, chain, key, ts) => {
    if (!seen[b]) seen[b] = {}
    if (!seen[b][chain]) seen[b][chain] = {}
    seen[b][chain][key] = ts
  }
  const put = (b, chain, key, reason) => {
    if (!state[b][chain]) state[b][chain] = {}
    state[b][chain][key] = reason
    const was = at((prior.firstSeen || {})[b], chain, key)
    // a recorded date is carried untouched; an entry absent from prior is new this run. Anything
    // else predates tracking, and leaving it undated rather than stamping it today is the point
    if (typeof was === 'number') setSeen(b, chain, key, was)
    else if (!at(prior[b], chain, key)) setSeen(b, chain, key, now)
  }
  const push = (map, chain, key) => {
    if (!map[chain]) map[chain] = []
    map[chain].push(key)
  }
  const each = (bucket, fn) => {
    for (const [chain, entries] of Object.entries(bucket || {})) {
      for (const [key, reason] of Object.entries(entries || {})) fn(chain, key, reason)
    }
  }
  const proven = (chain, key) => !!at(state.insolvent, chain, key)

  const ordered = [...monotonic, ...buckets.filter(b => !monotonic.includes(b))]

  for (const b of ordered) {
    if (monotonic.includes(b)) {
      each(prior[b], (chain, key, reason) => {
        const fresh = at(run[b], chain, key)
        if (fresh) {
          delta.refreshed[b].push(`${chain}|${key}`)
          put(b, chain, key, refreshReasons ? fresh : reason)
          return
        }
        if (wasReRead(chain, key)) delta.quiet[b].push(`${chain}|${key}`)
        put(b, chain, key, reason)
      })
      each(run[b], (chain, key, reason) => {
        if (at(state[b], chain, key)) return
        delta.added[b][chain] = { ...(delta.added[b][chain] || {}), [key]: reason }
        put(b, chain, key, reason)
        if (at(prior.stuck, chain, key)) push(delta.promoted, chain, key)
      })
      continue
    }
    each(prior[b], (chain, key, reason) => {
      if (proven(chain, key)) return
      if (at(run[b], chain, key)) return
      if (wasReRead(chain, key)) { push(delta.retired[b], chain, key); return }
      put(b, chain, key, reason) // couldn't reach it - keep yesterday's call
    })
    each(run[b], (chain, key, reason) => {
      if (proven(chain, key)) return
      if (!at(prior[b], chain, key)) delta.added[b][chain] = { ...(delta.added[b][chain] || {}), [key]: reason }
      put(b, chain, key, reason)
    })
  }
  state.firstSeen = { trackingSince: (prior.firstSeen || {}).trackingSince || now, ...seen }
  // `stampedAt` lets a caller tell a date this run invented from one carried out of the store -
  // the date archaeology may replace the former and must never touch the latter
  return { state, delta, stampedAt: now }
}

const countBucket = (bucket) => Object.values(bucket || {}).reduce((n, entries) => n + Object.keys(entries).length, 0)
const countAdded = (added) => Object.values(added || {}).reduce((n, entries) => n + Object.keys(entries).length, 0)
const countRetired = (retired) => Object.values(retired || {}).reduce((n, keys) => n + keys.length, 0)
const dropEmptyChains = (obj, filter = (entries) => entries) => Object.fromEntries(Object.entries(obj || {})
  .map(([chain, entries]) => [chain, Array.isArray(entries) ? entries : filter(entries, chain)])
  .filter(([, v]) => Object.keys(v).length))


const capitalize = (s) => s[0].toUpperCase() + s.slice(1)

async function publish({ name, cache, buckets, monotonic, state, delta, adapterExcluded, errors, opts, io }) {
  const counts = buckets.map(b => monotonic.includes(b)
    ? `${b} ${countBucket(state[b])} (+${countAdded(delta.added[b])} new, ${delta.refreshed[b].length} re-proven)`
    : `${b} ${countBucket(state[b])} (+${countAdded(delta.added[b])}/-${countRetired(delta.retired[b])})`)
  io.note(`${name}: ${counts.join(', ')}`)
  if (delta.quiet.insolvent.length) {
    io.note(`${name}: insolvent but no signal on this run's read (kept, use --fresh to clear): ${delta.quiet.insolvent.join(', ')}`)
  }
  const needs = [
    ...Object.entries(delta.added.insolvent).flatMap(([chain, entries]) => Object.keys(entries).map(key => `${chain}|${key}`)),
    ...delta.refreshed.insolvent,
  ].filter(k => !adapterExcluded.has(k))
  if (needs.length) io.note(`${name}: proven, and its adapter does not exclude it yet: ${needs.join(', ')}`)

  if (!opts.noWrite) io.note(`${name}: ${await saveState(cache, state)}`)
  if (opts.print) return state

  const doc = { cache: storeKey(cache), written: !opts.noWrite, totals: {} }
  for (const b of buckets) doc.totals[b] = countBucket(state[b])
  for (const b of buckets) {
    doc[`new${capitalize(b)}`] = dropEmptyChains(delta.added[b])
    if (b === 'insolvent') doc.promotedFromStuck = dropEmptyChains(delta.promoted)
    if (!monotonic.includes(b)) doc[`cleared${capitalize(b)}`] = dropEmptyChains(delta.retired[b])
  }
  doc.errors = errors
  return doc
}

// ###########################################################################
// ##  AAVE - v2 / v3 forks, graded per POOL
// ###########################################################################
// `isInsolvent: true` on a pool's registry entry empties the borrowed bucket for the
// WHOLE pool, so every debt signal here is gated behind ~100% utilization: zeroing a
// working pool over a small deficit would be worse than the deficit.
const AAVE = (() => {
  const CACHE = 'aave'
  const BUCKETS = ['insolvent', 'stuck']
  const MONOTONIC = ['insolvent']

  const ABI = {
    getReservesList: 'address[]:getReservesList',
    getAllReservesTokens: 'function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])',
    getReserveTokensAddresses: 'function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)',
    reserveDataV3: 'function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))',
    reserveDataV2: 'function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))',
    getReserveDeficit: 'function getReserveDeficit(address asset) view returns (uint256)', // v3.3+
    getVirtualUnderlyingBalance: 'function getVirtualUnderlyingBalance(address asset) view returns (uint128)', // v3.1+
    addressesProvider: 'address:ADDRESSES_PROVIDER',
    getPool: 'address:getPool',
    getLendingPool: 'address:getLendingPool',
    getPoolDataProvider: 'address:getPoolDataProvider',
    getAddress: 'function getAddress(bytes32 id) view returns (address)',
    getAddressesProvidersList: 'address[]:getAddressesProvidersList',
  }

  // LendingPoolAddressesProvider slot the v2 ProtocolDataProvider lives in
  const PDP_ID = '0x0100000000000000000000000000000000000000000000000000000000000000'

  // the tuning surface: only minUsd is on the cli, the rest are edited here
  const DEFAULTS = {
    minUsd: 10000, util: 0.999, dustUsd: 1000, gapBps: 50, staleDays: 30, supplyMult: 1.5,
    concurrency: 6, retries: 2,
  }

  // Adapters that build their addresses inside the tvl function are invisible to
  // discovery. Undiscovered and unresolved deployments both land in `errors`.
  const EXTRA_TARGETS = [
    { protocol: 'aave', chain: 'ethereum', candidates: ['0x52D306e36E3B6B02c153d0266ff0f85d18BCD413'] }, // v2 AddressesProviderRegistry, resolved lazily in projects/aave/index.js
    { protocol: 'aave-amm', chain: 'ethereum', candidates: ['0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB'] }, // AMM market LendingPool
  ]

  // An allowlist, because staking / pool2 / blacklistedTokens hold addresses too
  const ADDRESS_FIELDS = ['registry', 'addressesProviderRegistry', 'dataHelpers', 'poolDatas', 'poolData']

  function collectAddresses(value) {
    const out = []
    const add = (v) => { if (isAddress(v)) out.push(v) }
    if (typeof value === 'string') add(value)
    else if (Array.isArray(value)) value.forEach(add)
    else if (value && typeof value === 'object') {
      for (const field of ADDRESS_FIELDS) {
        const v = value[field]
        if (typeof v === 'string') add(v)
        else if (Array.isArray(v)) v.forEach(add)
      }
    }
    return out
  }

  function discoverFromRegistries(errors) {
    const targets = []
    eachRegistryEntry(['aave', 'aaveV3'], errors, (protocol, chain, value) => {
      const candidates = collectAddresses(value)
      if (!candidates.length) return
      targets.push({
        protocol, chain, candidates,
        isInsolvent: !!(value && typeof value === 'object' && value.isInsolvent),
      })
    })
    return targets
  }

  function discoverAdapters(errors) {
    return discoverFromAdapters({
      match: /aaveV3Export|aaveV2Export|aaveExports|aaveChainTvl/,
      missing: 'uses the aave helpers but exposes no address at load time - add its Pool to EXTRA_TARGETS to cover it',
      patch(captured) {
        const helper = require('../../projects/helper/aave')
        const make = (chain, candidates, isInsolvent) => {
          candidates = (candidates || []).filter(isAddress)
          if (!candidates.length) return null
          const target = {
            protocol: loading.protocol,
            chain: !chain || isAddress(chain) ? null : chain,
            candidates, isInsolvent: !!isInsolvent,
          }
          captured.push(target)
          return target
        }
        const orig = {
          v3: helper.aaveV3Export, exp: helper.aaveExports,
          tvl: helper.aaveChainTvl, v2: helper.aaveV2Export,
        }
        helper.aaveV3Export = function (config) {
          const result = orig.v3.call(this, config)
          for (const [chain, v] of Object.entries(config || {})) {
            const isObj = v && typeof v === 'object' && !Array.isArray(v)
            const pools = Array.isArray(v) ? v : (typeof v === 'string' ? [v] : (isObj && v.poolDatas) || [])
            const t = make(chain, pools, isObj && v.isInsolvent)
            if (t && result[chain]) tagExport(result[chain], t)
          }
          return result
        }
        helper.aaveExports = function (chain, registry, transform, dataHelpers, opts) {
          const result = orig.exp.call(this, chain, registry, transform, dataHelpers, opts)
          return tagExport(result, make(chain, [registry, ...(dataHelpers || [])], (opts || {}).isInsolvent))
        }
        helper.aaveChainTvl = function (chain, registry, transform, dataHelpers, ...rest) {
          const result = orig.tvl.call(this, chain, registry, transform, dataHelpers, ...rest)
          return tagExport(result, make(chain, [registry, ...(dataHelpers || [])], false))
        }
        helper.aaveV2Export = function (registry, opts) {
          const result = orig.v2.call(this, registry, opts)
          return tagExport(result, make(null, [registry], (opts || {}).isInsolvent))
        }
        const restoreSum = patchSumChainTvls()
        return () => {
          Object.assign(helper, { aaveV3Export: orig.v3, aaveExports: orig.exp, aaveChainTvl: orig.tvl, aaveV2Export: orig.v2 })
          restoreSum()
        }
      },
    }, errors)
  }

  const group = (discovered, opts, errors) => groupTargets(discovered, opts, errors, {
    addressesOf: (t) => t.candidates,
    blank: () => ({ candidates: [], isInsolvent: false }),
    merge: (g, t) => {
      for (const c of t.candidates) if (!g.candidates.some(x => lc(x) === lc(c))) g.candidates.push(c)
      g.isInsolvent = g.isInsolvent || t.isInsolvent
    },
  })


  async function resolveAddresses(api, candidates) {
    const pools = new Set()
    const pdps = new Set()
    const providers = new Set()

    const asPool = await api.multiCall({ abi: ABI.getReservesList, calls: candidates, permitFailure: true })
    const rest = []
    candidates.forEach((c, i) => {
      if (Array.isArray(asPool[i]) && asPool[i].length) pools.add(lc(c))
      else rest.push(c)
    })

    if (rest.length) {
      const asPdp = await api.multiCall({ abi: ABI.getAllReservesTokens, calls: rest, permitFailure: true })
      rest.forEach((c, i) => { if (Array.isArray(asPdp[i]) && asPdp[i].length) pdps.add(lc(c)) })

      const owned = await api.multiCall({ abi: ABI.addressesProvider, calls: rest, permitFailure: true })
      owned.forEach(p => { if (p && p !== NULL_ADDRESS) providers.add(lc(p)) })

      for (const c of rest) providers.add(lc(c))

      const lists = await api.multiCall({ abi: ABI.getAddressesProvidersList, calls: rest, permitFailure: true })
      lists.filter(Boolean).flat().forEach(p => { if (p && p !== NULL_ADDRESS) providers.add(lc(p)) })
    }

    const providerList = [...providers]
    if (providerList.length) {
      const [v3Pools, v2Pools, v3Pdps, v2Pdps] = await Promise.all([
        api.multiCall({ abi: ABI.getPool, calls: providerList, permitFailure: true }),
        api.multiCall({ abi: ABI.getLendingPool, calls: providerList, permitFailure: true }),
        api.multiCall({ abi: ABI.getPoolDataProvider, calls: providerList, permitFailure: true }),
        api.multiCall({ abi: ABI.getAddress, calls: providerList.map(p => ({ target: p, params: [PDP_ID] })), permitFailure: true }),
      ])
      for (const list of [v3Pools, v2Pools]) list.forEach(p => { if (p && p !== NULL_ADDRESS) pools.add(lc(p)) })
      for (const list of [v3Pdps, v2Pdps]) list.forEach(p => { if (p && p !== NULL_ADDRESS) pdps.add(lc(p)) })
    }

    return {
      pools: [...pools].filter(p => p !== NULL_ADDRESS),
      pdps: [...pdps].filter(p => p !== NULL_ADDRESS),
    }
  }

  async function buildDeployments(api, candidates) {
    const { pools, pdps } = await resolveAddresses(api, candidates)
    const uniq = (list) => [...new Set((list || []).filter(isAddress).map(lc))]

    const [poolReserves, pdpReserves] = await Promise.all([
      Promise.all(pools.map(p => api.call({ target: p, abi: ABI.getReservesList, permitFailure: true }).catch(() => null))),
      Promise.all(pdps.map(p => api.call({ target: p, abi: ABI.getAllReservesTokens, permitFailure: true }).catch(() => null))),
    ])
    const pdpSets = pdpReserves.map(r => uniq((r || []).map(t => t.tokenAddress)))

    const deployments = []
    const pairedPdps = new Set()
    pools.forEach((pool, i) => {
      const reserves = uniq(poolReserves[i])
      if (!reserves.length) return // retired or uninitialized
      let best = null, bestOverlap = 0
      pdpSets.forEach((set, j) => {
        const overlap = reserves.filter(r => set.includes(r)).length
        if (overlap > bestOverlap) { bestOverlap = overlap; best = pdps[j] }
      })
      if (best) pairedPdps.add(best)
      deployments.push({ pool, pdp: best, reserves })
    })

    pdps.forEach((pdp, j) => {
      if (pairedPdps.has(pdp) || !pdpSets[j].length) return
      deployments.push({ pool: null, pdp, reserves: pdpSets[j] })
    })

    return deployments
  }

  const plausibleReserveData = (d) => {
    if (!d) return false
    const ts = Number(d.lastUpdateTimestamp)
    return isAddress(d.aTokenAddress) && d.aTokenAddress !== NULL_ADDRESS
      && ts > 1.4e9 && ts < nowSec() + 86400
  }

  const pickTokens = (r, lastUpdate) => r && {
    aToken: r.aTokenAddress,
    sDebt: r.stableDebtTokenAddress,
    vDebt: r.variableDebtTokenAddress,
    lastUpdate: lastUpdate ? Number(r.lastUpdateTimestamp) : null,
  }

  async function readReserveTokens(api, { pool, pdp }, reserves) {
    if (pool) {
      for (const abi of [ABI.reserveDataV3, ABI.reserveDataV2]) {
        const probe = await api.call({ target: pool, abi, params: [reserves[0]], permitFailure: true }).catch(() => null)
        if (!plausibleReserveData(probe)) continue
        const rows = reserves.length === 1
          ? [probe]
          : await api.multiCall({ target: pool, abi, calls: reserves, permitFailure: true })
        return rows.map(r => plausibleReserveData(r) ? pickTokens(r, true) : null)
      }
    }
    if (pdp) {
      const rows = await api.multiCall({ target: pdp, abi: ABI.getReserveTokensAddresses, calls: reserves, permitFailure: true })
      if (rows.some(Boolean)) return rows.map(r => pickTokens(r, false))
    }
    return []
  }

  async function scanTarget(target) {
    const { protocol, chain, candidates, isInsolvent } = target
    const api = new sdk.ChainApi({ chain })
    const result = { protocol, chain, isInsolvent, reserves: [] }

    const deployments = await buildDeployments(api, candidates)
    if (!deployments.length) {
      result.skipped = `no Pool or PoolDataProvider behind ${candidates.join(', ')} - add its Pool to EXTRA_TARGETS`
      return result
    }

    const seenATokens = new Set()

    for (const dep of deployments) {
      const tokens = await readReserveTokens(api, dep, dep.reserves)
      if (!tokens.length) continue

      const idx = dep.reserves.map((r, i) => ({ reserve: r, t: tokens[i] }))
        .filter(x => x.t && isAddress(x.t.aToken) && x.t.aToken !== NULL_ADDRESS && !seenATokens.has(lc(x.t.aToken)))
      idx.forEach(x => seenATokens.add(lc(x.t.aToken)))
      if (!idx.length) continue

      const hasStable = idx.map(x => isAddress(x.t.sDebt) && x.t.sDebt !== NULL_ADDRESS)
      const [held, aSupply, vSupply, sSupply, underlyingSupply, decimals, symbols, deficits, virtual] = await Promise.all([
        api.multiCall({ abi: 'erc20:balanceOf', calls: idx.map(x => ({ target: x.reserve, params: x.t.aToken })), permitFailure: true }),
        api.multiCall({ abi: 'erc20:totalSupply', calls: idx.map(x => x.t.aToken), permitFailure: true }),
        api.multiCall({ abi: 'erc20:totalSupply', calls: idx.map(x => x.t.vDebt), permitFailure: true }),
        api.multiCall({ abi: 'erc20:totalSupply', calls: idx.map((x, i) => hasStable[i] ? x.t.sDebt : x.t.aToken), permitFailure: true }),
        api.multiCall({ abi: 'erc20:totalSupply', calls: idx.map(x => x.reserve), permitFailure: true }),
        api.multiCall({ abi: 'erc20:decimals', calls: idx.map(x => x.reserve), permitFailure: true }),
        api.multiCall({ abi: 'erc20:symbol', calls: idx.map(x => x.reserve), permitFailure: true }),
        dep.pool
          ? api.multiCall({ target: dep.pool, abi: ABI.getReserveDeficit, calls: idx.map(x => x.reserve), permitFailure: true })
          : Promise.resolve([]),
        dep.pool
          ? api.multiCall({ target: dep.pool, abi: ABI.getVirtualUnderlyingBalance, calls: idx.map(x => x.reserve), permitFailure: true })
          : Promise.resolve([]),
      ])

      const priceMap = await getPriceMap(chain, idx.map(x => x.reserve))
      const ts = nowSec()

      const virtualPool = virtual.some(v => v != null)

      idx.forEach(({ reserve, t }, i) => {
        if (held[i] == null || vSupply[i] == null) return
        if (virtualPool && virtual[i] == null) return
        const balance = BigInt(held[i])
        const liq = virtualPool ? BigInt(virtual[i]) : balance
        const sDebt = hasStable[i] && sSupply[i] != null ? BigInt(sSupply[i]) : 0n
        const debt = BigInt(vSupply[i]) + sDebt
        const supply = aSupply[i] != null ? BigInt(aSupply[i]) : null
        const deficit = deficits[i] != null ? BigInt(deficits[i]) : null

        const price = priceMap[lc(reserve)]
        const dec = decimals[i] != null ? Number(decimals[i]) : (price && price.decimals)
        const usd = (amount) => (dec == null || !price || price.price == null) ? null : (Number(amount) / 10 ** dec) * price.price

        const denom = liq + debt
        const gap = supply != null && supply > denom ? supply - denom : 0n
        const custody = virtualPool && liq > balance ? liq - balance : 0n
        const tokenSupply = underlyingSupply[i] != null ? BigInt(underlyingSupply[i]) : null

        result.reserves.push({
          pool: dep.pool || dep.pdp, reserve, symbol: symbols[i] || null,
          priced: !!(price && price.price != null),
          debt: debt.toString(),
          utilization: denom > 0n ? Number(debt) / Number(denom) : null,
          liquidityUsd: usd(liq), debtUsd: usd(debt),
          deficit: deficit == null ? null : deficit.toString(), deficitUsd: deficit == null ? null : usd(deficit),
          gapRaw: gap.toString(), gapUsd: usd(gap),
          gapShare: supply != null && supply > 0n ? Number(gap) / Number(supply) : 0,
          custodyRaw: custody.toString(), custodyUsd: usd(custody),
          custodyShare: liq > 0n ? Number(custody) / Number(liq) : 0,
          tokenSupply: tokenSupply == null ? null : tokenSupply.toString(),
          debtVsTokenSupply: tokenSupply != null && tokenSupply > 0n ? Number(debt) / Number(tokenSupply) : null,
          staleDays: t.lastUpdate ? (ts - t.lastUpdate) / 86400 : null,
        })
      })
    }

    return result
  }

  function classify(r, opts) {
    if (r.debt === '0') return null

    const pinned = r.utilization != null && r.utilization >= opts.util
    const dust = r.liquidityUsd != null && r.liquidityUsd < opts.dustUsd
      && (r.debtUsd == null || r.debtUsd >= opts.minUsd)
    if (!pinned && !dust) return null


    if (r.debtUsd != null && r.debtUsd < opts.minUsd) return null

    const signals = []
    const minGap = opts.gapBps / 10000

    const assetGone = r.tokenSupply === '0'

    if (r.deficit && r.deficit !== '0' && (r.deficitUsd == null || r.deficitUsd >= opts.minUsd)) {
      signals.push(`deficit ${fmtSize(r.deficitUsd, r.deficit)}`) // v3.3+ writes realized bad debt to storage
    }
    if (!assetGone && r.gapShare >= minGap && (r.gapUsd == null || r.gapUsd >= opts.minUsd)) {
      signals.push(`backing gap ${fmtSize(r.gapUsd, r.gapRaw)} (${fmtPct(r.gapShare)} of supply)`)
    }
    if (!assetGone && r.custodyShare >= minGap && (r.custodyUsd == null || r.custodyUsd >= opts.minUsd)) {
      signals.push(`custody gap ${fmtSize(r.custodyUsd, r.custodyRaw)} (${fmtPct(r.custodyShare)} of liquidity)`)
    }
    if (r.debtVsTokenSupply != null && r.debtVsTokenSupply >= opts.supplyMult) {
      signals.push(`unrepayable (${fmtMult(r.debtVsTokenSupply)} token supply)`)
    }

    const proven = signals.length > 0
    if (!proven) {
      if (assetGone) signals.push('underlying totalSupply is 0 (asset retired/migrated)')
      else if (r.staleDays != null && r.staleDays >= opts.staleDays) signals.push(`stale ${r.staleDays.toFixed(0)}d at max supply APY`)
    }
    if (!signals.length) return null

    const debtUsd = r.debtVsTokenSupply != null && r.debtVsTokenSupply >= 1
      ? `${fmtUsd(r.debtUsd)} notional` : fmtUsd(r.debtUsd) // beyond the token's supply it can't be marked to spot
    return {
      verdict: proven ? 'INSOLVENT' : 'STUCK',
      reason: `${signals.join(' + ')} — ${debtUsd} debt at ${fmtPct(r.utilization)} util`,
    }
  }

  function gradeRun(results, errors, opts) {
    const graded = verdictSet()
    const scanned = new Set()
    const adapterFlagged = new Set()
    for (const r of results) {
      if (!r) continue
      if (r.error) { errors.push(`${r.protocol} · ${r.chain}: ${r.error}`); continue }
      if (r.skipped) { errors.push(`${r.protocol} · ${r.chain}: ${r.skipped}`); continue }
      for (const res of r.reserves) {
        scanned.add(`${r.chain}|${res.pool}`)
        if (r.isInsolvent) adapterFlagged.add(`${r.chain}|${res.pool}`)
        const c = classify(res, opts)
        if (c) graded.add(r.chain, res.pool, c.verdict, res.symbol || res.reserve, c.reason)
      }
    }
    return { ...graded.buckets(), scanned, adapterFlagged }
  }

  async function run(opts, io) {
    const errors = []
    guardFresh(opts, 'aave')

    const prior = await loadPrior(CACHE, BUCKETS, opts)

    const targets = group([
      ...discoverFromRegistries(errors),
      ...discoverAdapters(errors),
      ...EXTRA_TARGETS.map(t => ({ isInsolvent: false, ...t })),
    ], opts, errors)

    const results = await runScans({
      targets, opts, scan: scanTarget,
      label: (t) => `${t.protocol}:${t.chain}`,
      onError: (t, error) => ({ protocol: t.protocol, chain: t.chain, isInsolvent: t.isInsolvent, reserves: [], error }),
    })
    const reserves = results.reduce((n, r) => n + ((r && r.reserves.length) || 0), 0)
    io.note(`aave: ${targets.length} deployments, ${reserves} reserves scanned`)

    const graded = gradeRun(results, errors, opts)
    const { state: merged, delta } = mergeBuckets({
      prior, run: graded, buckets: BUCKETS, monotonic: MONOTONIC,
      refreshReasons: true, // the pool is re-read every run, so keep the numbers current
      wasReRead: (chain, key) => graded.scanned.has(`${chain}|${key}`),
    })
    const state = { updatedAt: nowSec(), ...merged, errors }

    return publish({
      name: 'aave', cache: CACHE, buckets: BUCKETS, monotonic: MONOTONIC,
      state, delta, errors, opts, io, adapterExcluded: graded.adapterFlagged,
    })
  }

  return { name: 'aave', cache: CACHE, defaults: DEFAULTS, run }
})()

// ###########################################################################
// ##  COMPOUND - v2 forks and Comet (v3), graded per COMPTROLLER
// ###########################################################################
// The comptroller is the unit because `isInsolvent: true` in registries/compound.js (and
// in compoundExports2) empties the borrowed bucket for all of it.
//   liquidity = getCash(), debt = totalBorrows(), supplied = cash + borrows - reserves
// The debt signals share aave's ~100% utilization gate. The exchange-rate, delisted and
// oracle signals skip it: in Compound the exit can be shut without utilization moving,
// and a drained market may carry no debt to gate on.
const COMPOUND = (() => {
  const CACHE = 'compound'
  const BUCKETS = ['insolvent', 'stuck']
  const MONOTONIC = ['insolvent']

  const ABI = {
    getAllMarkets: 'address[]:getAllMarkets',
    allMarkets: 'address[]:allMarkets',
    getAlliTokens: 'address[]:getAlliTokens',
    markets: 'function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa)',
    oracle: 'address:oracle',
    priceOracle: 'address:priceOracle',
    getUnderlyingPrice: 'function getUnderlyingPrice(address cToken) view returns (uint256)',
    underlying: 'address:underlying',
    getCash: 'uint256:getCash',
    totalBorrows: 'uint256:totalBorrows',
    totalBorrow: 'uint256:totalBorrow',
    totalReserves: 'uint256:totalReserves',
    exchangeRateStored: 'uint256:exchangeRateStored',
    initialExchangeRateMantissa: 'uint256:initialExchangeRateMantissa',
    accrualBlockNumber: 'uint256:accrualBlockNumber',
    accrualBlockTimestamp: 'uint256:accrualBlockTimestamp',
    badDebt: 'uint256:badDebt',
    comptroller: 'address:comptroller',
    getAllPools: 'function getAllPools() view returns ((string name, address creator, address comptroller, uint256 blockPosted, uint256 timestampPosted)[])',
    getControllers: 'address[]:getControllers',
    cometBaseToken: 'address:baseToken',
    cometReserves: 'int256:getReserves',
    cometTotalSupply: 'uint256:totalSupply',
    cometTotalBorrow: 'uint256:totalBorrow',
    cometTotalsBasic: 'function totalsBasic() view returns ((uint64 baseSupplyIndex, uint64 baseBorrowIndex, uint64 trackingSupplyIndex, uint64 trackingBorrowIndex, uint104 totalSupplyBase, uint104 totalBorrowBase, uint40 lastAccrualTime, uint8 pauseFlags))',
  }

  const MANTISSA = 10n ** 18n
  const CF_MIN_PLAUSIBLE = 10n ** 16n // 1% - below this it isn't a collateral factor
  const CF_MIN_COVERAGE = 0.95        // share of supplied value needing a readable factor

  // the tuning surface: only minUsd is on the cli, the rest are edited here
  const DEFAULTS = {
    minUsd: 10000, util: 0.999, dustUsd: 1000, gapBps: 50, staleDays: 30, supplyMult: 1.5,
    erMult: 100, shortfallBps: 1000, oracleMult: 3,
    concurrency: 6, retries: 2,
  }

  // fallback for when the rpc won't hand us two block timestamps to measure from
  const SECONDS_PER_BLOCK = {
    ethereum: 12, polygon: 2, avax: 2, arbitrum: 0.25, optimism: 2, base: 2,
    xdai: 5, fantom: 1, metis: 2, celo: 5, bsc: 3, era: 1, linea: 3, scroll: 3,
    sonic: 1, soneium: 2, mantle: 2, harmony: 2, core: 3, flow: 1, plasma: 2,
    megaeth: 1, monad: 1, xlayer: 3, moonbeam: 12, moonriver: 12, cronos: 6,
    kava: 6, aurora: 1, heco: 3, okexchain: 3, klaytn: 1, wemix: 1, canto: 6,
    rsk: 30, iotex: 5, evmos: 2, blast: 2, mode: 2, taiko: 12, zircuit: 2,
    sei: 0.4, btr: 3, ink: 1, unichain: 1, apechain: 2, hemi: 12, goat: 3,
  }

  // Adapters that build their comptrollers inside the tvl function. A PoolRegistry or
  // controller registry works here too - buildDeployments expands those.
  const EXTRA_TARGETS = [
    { protocol: 'venus-isolated-pools', chain: 'bsc', candidates: ['0x9F7b01A536aFA00EF10310A162877fd792cD0666'] },
    { protocol: 'venus-isolated-pools', chain: 'ethereum', candidates: ['0x61CAff113CCaf05FFc6540302c37adcf077C5179'] },
    { protocol: 'venus-isolated-pools', chain: 'arbitrum', candidates: ['0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA'] },
    { protocol: 'sorta-fi', chain: 'arbitrum', candidates: ['0xE2D74A5f8101E6829409e4Fa8bBADCE2e0012C70'] },
    { protocol: 'inverse', chain: 'ethereum', candidates: ['0x4dcf7407ae5c07f8681e1659f626e114a7667339'] },
  ]

  function extractConfigs(value) {
    const out = []
    const push = (c) => {
      if (typeof c === 'string') {
        if (isAddress(c)) out.push({ comptroller: c })
        return
      }
      if (!c || typeof c !== 'object' || Array.isArray(c) || !isAddress(c.comptroller)) return
      out.push({
        comptroller: c.comptroller,
        cether: [c.cether].flat().filter(isAddress),
        cetheEquivalent: isAddress(c.cetheEquivalent) ? c.cetheEquivalent : null,
        blacklistedMarkets: [c.blacklistedMarkets].flat().filter(isAddress),
        marketsAbi: c.abis && typeof c.abis.getAllMarkets === 'string' ? c.abis.getAllMarkets : null,
        borrowsAbi: c.abis && typeof c.abis.totalBorrows === 'string' ? c.abis.totalBorrows : null,
        isInsolvent: !!c.isInsolvent,
      })
    }
    if (Array.isArray(value)) value.forEach(push)
    else push(value)
    return out
  }

  function discoverFromRegistries(errors) {
    const targets = []
    eachRegistryEntry(['compound'], errors, (protocol, chain, value) => {
      const found = extractConfigs(value)
      if (found.length) targets.push({ protocol, chain, configs: found })
    })
    return targets
  }

  function discoverAdapters(errors) {
    const covered = new Set(EXTRA_TARGETS.map(t => t.protocol))
    return discoverFromAdapters({
      match: /compoundExports|compoundV3Exports/,
      stripComments: true, // a commented-out import would report an adapter that isn't one
      covered: (protocol) => covered.has(protocol),
      missing: 'uses the compound helpers but exposes no comptroller at load time - add a source for it to EXTRA_TARGETS to cover it',
      patch(captured) {
        const helper = require('../../projects/helper/compound')
        const helperV3 = require('../../projects/helper/compoundV3')
        const make = (configs) => {
          if (!configs.length) return null
          const target = { protocol: loading.protocol, chain: null, configs }
          captured.push(target)
          return target
        }
        const orig = { one: helper.compoundExports, two: helper.compoundExports2, v3: helperV3.compoundV3Exports }

        helper.compoundExports = function (comptroller, cether, cetheEquivalent, opts) {
          const result = orig.one.call(this, comptroller, cether, cetheEquivalent, opts)
          return tagExport(result, make(extractConfigs({ comptroller, cether, cetheEquivalent, ...(opts || {}) })))
        }
        helper.compoundExports2 = function (config) {
          const result = orig.two.call(this, config)
          return tagExport(result, make(extractConfigs(config)))
        }
        // Comet configs are keyed by chain, so these need no tagging
        helperV3.compoundV3Exports = function (config) {
          for (const [chain, v] of Object.entries(config || {})) {
            const comets = [...new Set([...((v || {}).markets || [])].filter(isAddress).map(lc))]
            if (comets.length) captured.push({ protocol: loading.protocol, chain, configs: [], comets })
          }
          return orig.v3.call(this, config)
        }
        const restoreSum = patchSumChainTvls()
        return () => {
          Object.assign(helper, { compoundExports: orig.one, compoundExports2: orig.two })
          helperV3.compoundV3Exports = orig.v3
          restoreSum()
        }
      },
    }, errors)
  }

  function group(discovered, opts, errors) {
    const targets = groupTargets(discovered, opts, errors, {
      addressesOf: (t) => (t.configs || []).map(c => c.comptroller),
      blank: () => ({ configs: [], comets: [] }),
      merge: (g, t) => {
        for (const c of t.configs || []) if (!g.configs.some(x => lc(x.comptroller) === lc(c.comptroller))) g.configs.push(c)
        for (const c of t.comets || []) if (!g.comets.includes(c)) g.comets.push(c)
      },
    })
    for (const t of targets) {
      t.cether = {}       // cToken -> the wrapped-native address to price it with
      t.blacklisted = new Set()
      t.knownInsolvent = new Set()
      t.listAbis = []
      t.borrowsAbis = []
      for (const c of t.configs) {
        for (const m of c.cether || []) t.cether[lc(m)] = c.cetheEquivalent || NULL_ADDRESS
        for (const m of c.blacklistedMarkets || []) t.blacklisted.add(lc(m))
        if (c.isInsolvent) t.knownInsolvent.add(lc(c.comptroller))
        if (c.marketsAbi && !t.listAbis.includes(c.marketsAbi)) t.listAbis.push(c.marketsAbi)
        if (c.borrowsAbi && !t.borrowsAbis.includes(c.borrowsAbi)) t.borrowsAbis.push(c.borrowsAbi)
      }
      t.listAbis.push(ABI.getAllMarkets, ABI.allMarkets, ABI.getAlliTokens)
      t.borrowsAbis.push(ABI.totalBorrows, ABI.totalBorrow)
      t.listAbis = [...new Set(t.listAbis)]
      t.borrowsAbis = [...new Set(t.borrowsAbis)]
    }
    return targets
  }

  async function buildDeployments(api, target) {
    const found = new Map()
    const comets = new Set(target.comets || [])
    const seen = new Set()
    let queue = [...new Set(target.configs.map(c => lc(c.comptroller)))]

    for (let round = 0; round < 2 && queue.length; round++) {
      const pending = queue.filter(a => !seen.has(a))
      pending.forEach(a => seen.add(a))
      queue = []
      if (!pending.length) break

      let rest = pending
      for (const abi of target.listAbis) {
        if (!rest.length) break
        const lists = await api.multiCall({ abi, calls: rest, permitFailure: true })
        const next = []
        rest.forEach((addr, i) => {
          const list = [...new Set((lists[i] || []).filter(isAddress).map(lc))].filter(m => m !== NULL_ADDRESS)
          if (list.length) found.set(addr, list)
          else next.push(addr)
        })
        rest = next
      }
      if (!rest.length || round > 0) break

      const [owners, pools, controllers, cometBases] = await Promise.all([
        api.multiCall({ abi: ABI.comptroller, calls: rest, permitFailure: true }),
        api.multiCall({ abi: ABI.getAllPools, calls: rest, permitFailure: true }),
        api.multiCall({ abi: ABI.getControllers, calls: rest, permitFailure: true }),
        api.multiCall({ abi: ABI.cometBaseToken, calls: rest, permitFailure: true }),
      ])
      const add = (addr) => { if (isAddress(addr) && lc(addr) !== NULL_ADDRESS) queue.push(lc(addr)) }
      owners.forEach(add)
      pools.filter(Boolean).flat().forEach(p => add(p && p.comptroller))
      controllers.filter(Boolean).flat().forEach(add)
      rest.forEach((addr, i) => { if (isAddress(cometBases[i]) && cometBases[i] !== NULL_ADDRESS) comets.add(addr) })
    }

    const deployments = []
    const signatures = new Set()
    for (const [comptroller, markets] of found) {
      const sig = markets.slice().sort().join(',')
      if (signatures.has(sig)) continue
      signatures.add(sig)
      deployments.push({ kind: 'v2', comptroller, markets })
    }
    for (const comet of comets) deployments.push({ kind: 'comet', comptroller: comet, markets: [comet] })
    return deployments
  }

  const clocks = {}
  function chainClock(chain) {
    if (!clocks[chain]) clocks[chain] = (async () => {
      const fallback = { block: null, ts: nowSec(), spb: SECONDS_PER_BLOCK[chain] || 2 }
      try {
        const provider = sdk.getProvider(chain)
        const head = await provider.getBlock('latest')
        if (!head || !head.timestamp) return fallback
        const clock = { block: head.number, ts: Number(head.timestamp), spb: fallback.spb }
        const back = Math.min(10000, head.number - 1)
        if (back > 100) {
          const prev = await provider.getBlock(head.number - back).catch(() => null)
          const delta = prev && Number(head.timestamp) - Number(prev.timestamp)
          if (delta > 0) clock.spb = delta / back
        }
        return clock
      } catch (e) { return fallback }
    })()
    return clocks[chain]
  }

  function staleDaysOf(accrual, clock) {
    const v = Number(accrual)
    if (!Number.isFinite(v) || v <= 0) return null
    const age = v >= 1.4e9
      ? clock.ts - v
      : (clock.block == null ? null : (clock.block - v) * clock.spb)
    if (age == null || age < 0) return null
    return age / 86400
  }

  async function scanComptroller(api, target, dep, clock, opts) {
    const { chain } = target
    const cTokens = dep.markets
    const n = cTokens.length

    const [underlyings, cash, reserves, cSupply, erStored, initialEr, cDecimals, accrualBn, accrualTs, badDebt, listing, oracles] = await Promise.all([
      api.multiCall({ abi: ABI.underlying, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.getCash, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.totalReserves, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: 'erc20:totalSupply', calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.exchangeRateStored, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.initialExchangeRateMantissa, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: 'erc20:decimals', calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.accrualBlockNumber, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.accrualBlockTimestamp, calls: cTokens, permitFailure: true }),
      api.multiCall({ abi: ABI.badDebt, calls: cTokens, permitFailure: true }),
      api.multiCall({ target: dep.comptroller, abi: ABI.markets, calls: cTokens, permitFailure: true }),
      Promise.all([ABI.oracle, ABI.priceOracle].map(abi => api.call({ target: dep.comptroller, abi, permitFailure: true }).catch(() => null))),
    ])

    const borrows = new Array(n).fill(null)
    for (const abi of target.borrowsAbis) {
      const missing = cTokens.map((c, i) => ({ c, i })).filter(x => borrows[x.i] == null)
      if (!missing.length) break
      const res = await api.multiCall({ abi, calls: missing.map(x => x.c), permitFailure: true })
      missing.forEach((x, k) => { if (res[k] != null) borrows[x.i] = res[k] })
    }

    const assets = [], native = []
    cTokens.forEach((c, i) => {
      const own = isAddress(underlyings[i]) && underlyings[i] !== NULL_ADDRESS ? lc(underlyings[i]) : null
      const wrapped = target.cether[c]
      assets[i] = own || (wrapped === undefined ? null : lc(wrapped))
      native[i] = !own && assets[i] != null
    })
    const erc20 = cTokens.map((c, i) => assets[i] && assets[i] !== NULL_ADDRESS ? { i, target: assets[i] } : null).filter(Boolean)

    const oracle = oracles.find(o => isAddress(o) && o !== NULL_ADDRESS)
    const [uDecimals, symbols, uSupply, held, oraclePrices, priceMap] = await Promise.all([
      subCall(api, n, 'erc20:decimals', erc20),
      subCall(api, n, 'erc20:symbol', erc20),
      subCall(api, n, 'erc20:totalSupply', erc20),
      subCall(api, n, 'erc20:balanceOf', erc20.map(e => ({ ...e, params: cTokens[e.i] }))),
      oracle
        ? api.multiCall({ target: oracle, abi: ABI.getUnderlyingPrice, calls: cTokens, permitFailure: true })
        : Promise.resolve(new Array(n).fill(null)),
      getPriceMap(chain, assets),
    ])

    const meta = cTokens.map((c, i) => {
      const price = assets[i] ? priceMap[assets[i]] : undefined
      const dec = uDecimals[i] != null ? Number(uDecimals[i])
        : (assets[i] === NULL_ADDRESS ? 18 : (price && price.decimals != null ? Number(price.decimals) : null))
      return {
        dec,
        llama: price && price.price != null ? Number(price.price) : null,
        oracle: oracle && oraclePrices[i] != null && dec != null ? Number(oraclePrices[i]) / 10 ** (36 - dec) : null, // scaled 1e(36 - underlyingDecimals)
      }
    })
    const ratios = meta.filter(m => m.llama > 0 && m.oracle > 0).map(m => m.oracle / m.llama).sort((a, b) => a - b)
    const scale = ratios.length ? ratios[Math.floor(ratios.length / 2)] : null
    const oracleUsable = scale > 0 && ratios.length >= 2
      && ratios.filter(x => x >= scale / 2 && x <= scale * 2).length >= ratios.length * 0.8

    const normEr = cTokens.map((c, i) => erStored[i] != null && meta[i].dec != null && cDecimals[i] != null
      ? Number(erStored[i]) / 10 ** (18 + meta[i].dec - Number(cDecimals[i]))
      : null)
    const erSample = normEr.filter(v => v > 0).sort((a, b) => a - b)
    const erMedian = erSample.length >= 3 ? erSample[Math.floor(erSample.length / 2)] : null

    const markets = []
    const agg = {
      comptroller: dep.comptroller, markets: n,
      debtUsd: 0, collateralUsd: 0, suppliedUsd: 0, coveredUsd: 0,
      unpriced: 0, oracleFallback: 0, inflated: 0,
    }
    let cfBroken = false, cfPlausible = 0

    cTokens.forEach((cToken, i) => {
      if (assets[i] == null || cash[i] == null || borrows[i] == null) return // see the caller's tally
      const liq = BigInt(cash[i])
      const debt = BigInt(borrows[i])
      const resv = reserves[i] != null ? BigInt(reserves[i]) : 0n
      const supplied = liq + debt > resv ? liq + debt - resv : 0n

      const { dec, llama, oracle: oraclePrice } = meta[i]
      const usd = (amount) => (dec == null || llama == null) ? null : (Number(amount) / 10 ** dec) * llama

      let erDrop = null
      const shares = cSupply[i] != null ? BigInt(cSupply[i]) : null
      if (erStored[i] != null && shares != null && shares > 0n) {
        const er = BigInt(erStored[i])
        const initial = initialEr[i] != null ? BigInt(initialEr[i]) : 0n
        if (initial > 0n) {
          if (er * BigInt(Math.round(opts.erMult)) <= initial) {
            erDrop = { mult: Number(initial) / Number(er), against: 'the initial rate it was deployed with' }
          }
        } else if (erMedian && normEr[i] > 0 && normEr[i] * opts.erMult <= erMedian) {
          erDrop = { mult: erMedian / normEr[i], against: "the comptroller's other markets" }
        }
      }

      const balance = !native[i] && held[i] != null ? BigInt(held[i]) : null
      const custody = balance != null && liq > balance ? liq - balance : 0n
      const tokenSupply = !native[i] && uSupply[i] != null ? BigInt(uSupply[i]) : null
      const deficit = badDebt[i] != null ? BigInt(badDebt[i]) : null

      const row = listing[i]
      const cf = row && row.collateralFactorMantissa != null ? BigInt(row.collateralFactorMantissa) : null
      const cfKind = cf == null ? 'unreadable'
        : cf > MANTISSA ? 'insane'
          : cf === 0n ? 'zero'
            : cf >= CF_MIN_PLAUSIBLE ? 'plausible' : 'garbage'
      if (cfKind === 'unreadable' || cfKind === 'insane') cfBroken = true
      if (cfKind === 'plausible') cfPlausible++

      const liquidityUsd = usd(liq)
      const debtUsd = usd(debt)
      const suppliedUsd = usd(supplied)

      const collateralPrice = llama != null ? llama : (oracleUsable && oraclePrice > 0 ? oraclePrice / scale : null)
      const collateralUsd = (dec == null || collateralPrice == null) ? null : (Number(supplied) / 10 ** dec) * collateralPrice

      const inflated = tokenSupply != null && tokenSupply > 0n && debt > tokenSupply
      if (inflated) agg.inflated++
      else if (debtUsd != null) agg.debtUsd += debtUsd
      if (collateralUsd == null) {
        if (liq > 0n || debt > 0n) agg.unpriced++
      } else {
        agg.suppliedUsd += collateralUsd
        if (cfKind === 'plausible') {
          agg.collateralUsd += collateralUsd * (Number(cf) / 1e18)
          agg.coveredUsd += collateralUsd
        } else if (cfKind === 'zero') {
          agg.coveredUsd += collateralUsd
        }
        if (llama == null) agg.oracleFallback++
      }

      const denom = liq + debt
      markets.push({
        comptroller: dep.comptroller, market: cToken, kind: 'v2',
        symbol: symbols[i] || (assets[i] === NULL_ADDRESS ? 'native' : null),
        blacklisted: target.blacklisted.has(cToken),
        priced: llama != null,
        debt: debt.toString(),
        utilization: denom > 0n ? Number(debt) / Number(denom) : null,
        liquidityUsd, debtUsd, suppliedUsd,
        deficit: deficit == null ? null : deficit.toString(), deficitUsd: deficit == null ? null : usd(deficit),
        custodyRaw: custody.toString(), custodyUsd: usd(custody),
        custodyShare: liq > 0n ? Number(custody) / Number(liq) : 0,
        tokenSupply: tokenSupply == null ? null : tokenSupply.toString(),
        debtVsTokenSupply: tokenSupply != null && tokenSupply > 0n ? Number(debt) / Number(tokenSupply) : null,
        // a token still showing a balance for the market while reporting no supply (some
        // native wrappers) isn't gone, it just doesn't track totalSupply
        assetGone: tokenSupply === 0n && (balance == null || balance === 0n),
        erDrop,
        listed: row && row.isListed != null ? !!row.isListed : null,
        oracleZero: !!oracle && oraclePrices[i] != null && Number(oraclePrices[i]) === 0,
        oracleRatio: oracleUsable && oraclePrice > 0 && llama > 0 ? (oraclePrice / llama) / scale : null,
        staleDays: staleDaysOf(accrualTs[i] != null ? accrualTs[i] : accrualBn[i], clock),
      })
    })

    const covered = agg.suppliedUsd === 0 || agg.coveredUsd >= agg.suppliedUsd * CF_MIN_COVERAGE
    agg.skipReason = markets.length !== n ? `${n - markets.length} of ${n} markets unreadable`
      : agg.unpriced ? `${agg.unpriced} of ${n} markets unpriced`
        : cfBroken || !cfPlausible ? 'collateral factors unreadable'
          : !covered ? `collateral factors cover only ${fmtPct(agg.coveredUsd / agg.suppliedUsd)} of the balance sheet`
            : null
    agg.usable = !agg.skipReason
    return { markets, aggregate: agg, scanned: markets.length }
  }

  async function scanComet(api, target, dep, clock) {
    const comet = dep.comptroller
    const [base, reserves, supply, borrow, basic] = await Promise.all([
      api.call({ target: comet, abi: ABI.cometBaseToken, permitFailure: true }),
      api.call({ target: comet, abi: ABI.cometReserves, permitFailure: true }),
      api.call({ target: comet, abi: ABI.cometTotalSupply, permitFailure: true }),
      api.call({ target: comet, abi: ABI.cometTotalBorrow, permitFailure: true }),
      api.call({ target: comet, abi: ABI.cometTotalsBasic, permitFailure: true }),
    ])
    if (!isAddress(base) || reserves == null || borrow == null) return { markets: [], aggregate: null, scanned: 0 }

    const asset = lc(base)
    const [held, dec, symbol, tokenSupply, priceMap] = await Promise.all([
      api.call({ target: asset, abi: 'erc20:balanceOf', params: comet, permitFailure: true }),
      api.call({ target: asset, abi: 'erc20:decimals', permitFailure: true }),
      api.call({ target: asset, abi: 'erc20:symbol', permitFailure: true }),
      api.call({ target: asset, abi: 'erc20:totalSupply', permitFailure: true }),
      getPriceMap(target.chain, [asset]),
    ])

    const price = priceMap[asset]
    const decimals = dec != null ? Number(dec) : (price && price.decimals != null ? Number(price.decimals) : null)
    const usd = (amount) => (decimals == null || !price || price.price == null) ? null : (Number(amount) / 10 ** decimals) * price.price

    const debt = BigInt(borrow)
    const resv = BigInt(reserves)
    const deficit = resv < 0n ? -resv : 0n
    const liq = held != null ? BigInt(held) : (supply != null ? BigInt(supply) + resv - debt : 0n)
    const denom = liq + debt

    const market = {
      comptroller: comet, market: comet, kind: 'comet',
      symbol: symbol || null,
      blacklisted: false,
      priced: !!(price && price.price != null),
      debt: debt.toString(),
      utilization: denom > 0n ? Number(debt) / Number(denom) : null,
      liquidityUsd: usd(liq), debtUsd: usd(debt), suppliedUsd: supply != null ? usd(BigInt(supply)) : null,
      deficit: deficit.toString(), deficitUsd: usd(deficit),
      custodyRaw: '0', custodyUsd: null, custodyShare: 0,
      tokenSupply: tokenSupply == null ? null : BigInt(tokenSupply).toString(),
      debtVsTokenSupply: tokenSupply != null && BigInt(tokenSupply) > 0n ? Number(debt) / Number(tokenSupply) : null,
      assetGone: tokenSupply != null && BigInt(tokenSupply) === 0n && (held == null || BigInt(held) === 0n),
      erDrop: null, listed: null, oracleZero: false, oracleRatio: null,
      staleDays: basic && basic.lastAccrualTime ? staleDaysOf(basic.lastAccrualTime, clock) : null,
    }
    return { markets: [market], aggregate: null, scanned: 1 }
  }

  async function scanTarget(target, opts) {
    const { protocol, chain } = target
    const api = new sdk.ChainApi({ chain })
    const result = { protocol, chain, knownInsolvent: [...target.knownInsolvent], markets: [], aggregates: [] }

    const deployments = await buildDeployments(api, target)
    if (!deployments.length) {
      const tried = [...target.configs.map(c => c.comptroller), ...(target.comets || [])].join(', ')
      result.skipped = `no comptroller or comet behind ${tried} - add a source for it to EXTRA_TARGETS`
      return result
    }

    const clock = await chainClock(chain)
    for (const dep of deployments) {
      const { markets, aggregate, scanned } = dep.kind === 'comet'
        ? await scanComet(api, target, dep, clock)
        : await scanComptroller(api, target, dep, clock, opts)
      if (!scanned) {
        result.unreadable = [...(result.unreadable || []), `${dep.comptroller} (${dep.markets.length} markets)`]
        continue
      }
      result.markets.push(...markets)
      if (aggregate) result.aggregates.push(aggregate)
    }
    return result
  }

  function classify(r, opts) {
    const hard = [], soft = []
    const minGap = opts.gapBps / 10000
    const material = (usd) => usd == null || usd >= opts.minUsd // unpriced passes and gets tagged

    // Ungated, and all three need a price, so unpriced markets don't reach them.
    const sizable = r.suppliedUsd != null && r.suppliedUsd >= opts.minUsd
    if (r.erDrop && sizable) {
      soft.push(`exchange rate ${fmtMult(r.erDrop.mult)} below ${r.erDrop.against} on ${fmtUsd(r.suppliedUsd)} supplied (drained, or this fork means something else by it - review)`)
    }
    // redeemAllowed rejects unlisted markets, so the exit is shut regardless of utilization
    if (r.listed === false && sizable) {
      soft.push(`delisted by the comptroller with ${fmtUsd(r.suppliedUsd)} still supplied (redeem reverts)`)
    }
    if (r.oracleZero && sizable) {
      soft.push('comptroller oracle prices the underlying at 0 (liquidations and redeems revert)')
    }

    const pinned = r.utilization != null && r.utilization >= opts.util
    const dust = r.liquidityUsd != null && r.liquidityUsd < opts.dustUsd
      && (r.debtUsd == null || r.debtUsd >= opts.minUsd)
    const assetGone = !!r.assetGone // every balance-derived signal is degenerate once true

    if (r.debt !== '0' && (pinned || dust) && material(r.debtUsd)) {
      if (r.deficit && r.deficit !== '0' && material(r.deficitUsd)) {
        hard.push(r.kind === 'comet'
          ? `negative reserves ${fmtSize(r.deficitUsd, r.deficit)} (supplier claims exceed cash + debt owed)`
          : `bad debt ${fmtSize(r.deficitUsd, r.deficit)} written off on the market`)
      }
      if (!assetGone && r.custodyShare >= minGap && material(r.custodyUsd)) {
        hard.push(`custody gap ${fmtSize(r.custodyUsd, r.custodyRaw)} (${fmtPct(r.custodyShare)} of cash)`)
      }
      // an elastic underlying (dForce USX/EUX, Sumer suUSD, a bridged wrapper) CAN be
      // minted to repay, so read the reason before acting - but a borrowed figure several
      // times the token's own supply is not a number to count either way
      if (r.debtVsTokenSupply != null && r.debtVsTokenSupply >= opts.supplyMult) {
        hard.push(`unrepayable (${fmtMult(r.debtVsTokenSupply)} token supply)`)
      }
      if (!hard.length) {
        if (assetGone) soft.push('underlying totalSupply is 0 (asset retired/migrated)')
        else if (r.staleDays != null && r.staleDays >= opts.staleDays) soft.push(`no interest accrual in ${r.staleDays.toFixed(0)}d at ${fmtPct(r.utilization)} util`)
        if (r.oracleRatio != null && r.oracleRatio >= opts.oracleMult) soft.push(`comptroller oracle ${fmtMult(r.oracleRatio)} the market price (inflation/manipulation candidate)`)
      }
    }

    if (!hard.length && !soft.length) return null
    const debtUsd = r.debtVsTokenSupply != null && r.debtVsTokenSupply >= 1
      ? `${fmtUsd(r.debtUsd)} notional` : fmtUsd(r.debtUsd)
    const tail = r.debt === '0'
      ? `${fmtUsd(r.suppliedUsd)} supplied, nothing borrowed`
      : `${debtUsd} debt at ${fmtPct(r.utilization)} util`
    return {
      // unpriced can't be sized, so on its own it never reaches the proven tier
      verdict: hard.length && r.priced ? 'INSOLVENT' : 'STUCK',
      reason: `${[...hard, ...soft].join(' + ')} — ${tail}`,
    }
  }

  function classifyAggregate(a, opts) {
    if (!a || !a.usable) return null
    const shortfall = a.debtUsd - a.collateralUsd
    if (shortfall < opts.minUsd) return null
    if (shortfall < a.debtUsd * opts.shortfallBps / 10000) return null
    return {
      verdict: 'INSOLVENT',
      reason: `comptroller-wide shortfall ${fmtUsd(shortfall)}: ${fmtUsd(a.debtUsd)} borrowed against ${fmtUsd(a.collateralUsd)} of collateral-factored supply across ${a.markets} markets`,
    }
  }

  function gradeRun(results, errors, opts) {
    const graded = verdictSet()
    const scanned = new Set()
    const adapterFlagged = new Set()
    for (const r of results) {
      if (!r) continue
      for (const c of r.knownInsolvent || []) adapterFlagged.add(`${r.chain}|${lc(c)}`)
      if (r.error) { errors.push(`${r.protocol} · ${r.chain}: ${r.error}`); continue }
      if (r.skipped) { errors.push(`${r.protocol} · ${r.chain}: ${r.skipped}`); continue }
      for (const u of r.unreadable || []) errors.push(`${r.protocol} · ${r.chain}: no market state readable on ${u} - not a compound fork, or the rpc dropped the calls`)

      for (const m of r.markets) {
        scanned.add(`${r.chain}|${m.comptroller}`)
        const c = classify(m, opts)
        if (c) graded.add(r.chain, m.comptroller, c.verdict, m.symbol || m.market, c.reason)
      }
      for (const a of r.aggregates || []) {
        const c = classifyAggregate(a, opts)
        if (c) { graded.add(r.chain, a.comptroller, c.verdict, 'comptroller', c.reason); continue }
        // the shortfall check is the only read on ordinary bad debt, so if it couldn't
        // run and nothing else flagged the comptroller, say so rather than call it clean
        if (a.skipReason && a.debtUsd >= opts.minUsd && !graded.has(r.chain, a.comptroller)) {
          errors.push(`${r.protocol} · ${r.chain}: shortfall check skipped on ${a.comptroller} (${fmtUsd(a.debtUsd)} priced debt) - ${a.skipReason}`)
        }
      }
    }
    return { ...graded.buckets(), scanned, adapterFlagged }
  }

  async function run(opts, io) {
    const errors = []
    guardFresh(opts, 'compound')

    const prior = await loadPrior(CACHE, BUCKETS, opts)

    const targets = group([
      ...discoverFromRegistries(errors),
      ...discoverAdapters(errors),
      ...EXTRA_TARGETS.map(t => ({ protocol: t.protocol, chain: t.chain, configs: t.candidates.map(c => ({ comptroller: c })) })),
    ], opts, errors)

    const results = await runScans({
      targets, opts, scan: scanTarget,
      label: (t) => `${t.protocol}:${t.chain}`,
      onError: (t, error) => ({ protocol: t.protocol, chain: t.chain, knownInsolvent: [...t.knownInsolvent], markets: [], aggregates: [], error }),
    })
    const markets = results.reduce((n, r) => n + ((r && r.markets.length) || 0), 0)
    io.note(`compound: ${targets.length} deployments, ${markets} markets scanned`)

    const graded = gradeRun(results, errors, opts)
    const { state: merged, delta } = mergeBuckets({
      prior, run: graded, buckets: BUCKETS, monotonic: MONOTONIC, refreshReasons: true,
      wasReRead: (chain, key) => graded.scanned.has(`${chain}|${key}`),
    })
    const state = { updatedAt: nowSec(), ...merged, errors }

    return publish({
      name: 'compound', cache: CACHE, buckets: BUCKETS, monotonic: MONOTONIC,
      state, delta, errors, opts, io, adapterExcluded: graded.adapterFlagged,
    })
  }

  return { name: 'compound', cache: CACHE, defaults: DEFAULTS, run }
})()

// ###########################################################################
// ##  MORPHO BLUE - graded per MARKET ID
// ###########################################################################
// Ids paste into `blacklistedMarketIds` in projects/morpho-blue/config.js; the extra
// `tokens` bucket into that chain's `blackList`.
//
// The `vaults` bucket is for a different reader. A curated vault is valued at totalAssets()
// (projects/helper/curators), which counts its supply position in every market it allocates to -
// so a position in a market proven insolvent here inflates it, and no market id can reach that
// because the curator adapters only ever see the vault address. The ids get resolved back to the
// vaults holding them, per chain, and only for chains that carry an insolvent id.
//
// Markets are isolated and blacklisted one id at a time, so unlike aave, proven bad debt
// flags on its own and the utilization gate applies only to the FROZEN tier;
// proportionality comes from --gap-bps instead.
//
// Morpho Blue is a singleton holding every market's loan liquidity AND every market's
// collateral in one balance, and market(id) carries no collateral total - so per-market
// facts come from the market struct, and anything collateral-side is bounded by what the
// singleton actually holds of that token.
//
// A market already in `insolvent` is not re-graded and nothing is read for it; the stored
// reason is the record. A market the ADAPTER hardcodes IS still graded - hardcoding is
// not a verdict, and it is what this list replaces - so the list ends up a superset.
const MORPHO = (() => {
  const CACHE = 'morpho-blue' // the published file has always had this name
  const BUCKETS = ['insolvent', 'stuck', 'tokens', 'vaults']
  const MONOTONIC = ['insolvent', 'tokens']

  const ABI = {
    idToMarketParams: 'function idToMarketParams(bytes32 id) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
    market: 'function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
    position: 'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
    oraclePrice: 'function price() view returns (uint256)',
    createMarket: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)',
  }

  const VAULT_ABI = {
    liquidityAdapter: 'address:liquidityAdapter', 
    adapters: 'function adapters(uint256) view returns (address)',
    adaptersLength: 'uint256:adaptersLength',
    morphoVaultV1: 'address:morphoVaultV1',
    withdrawQueueLength: 'uint256:withdrawQueueLength',
    withdrawQueue: 'function withdrawQueue(uint256) view returns (bytes32)',
    asset: 'address:asset',
    totalAssets: 'uint256:totalAssets',
    lostAssets: 'uint256:lostAssets',
    balanceOf: 'function balanceOf(address account) view returns (uint256)',
    convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
    name: 'string:name',
  }

  const VIRTUAL_SHARES = 1000000n
  const MAX_ADAPTERS = 64 
  const MAX_QUEUE = 128

  const DEFAULTS = {
    minUsd: 10000, gapBps: 50, oracleMult: 5, supplyMult: 1.5, interestMult: 10,
    util: 0.999, dustUsd: 1000, staleDays: 30, frozenUsd: 500000,
    vaultShareBps: 500,
    cluster: 5, concurrency: 4, retries: 2,
  }

  // sei runs onlyUseExistingCache and its CreateMarket cache doesn't cover these, so
  // projects/morpho-blue/index.js adds them by hand. Keep in sync or they go unscanned.
  const EXTRA_MARKET_IDS = {
    sei: [
      '0x583da8629bb612169bb4d5753d94d66bffa4390b4f16833a210b75944172f811',
      '0xbb3ef4b802087585438dc6ee178e295f404d133996880db5e23405d1d73f1d27',
      '0xe3c959829d236e3838558318340129a737ae0fffa128d891d1d22728d081e419',
      '0xc56578519e8fb30628d3b8d459193017e776ce8477c0bbf0f2c8de82bd8dccc9',
      '0xd2fa0b94b6f04615c9472bb25bcb755f5ad5a8f4c17fc04837a31046f0ba5c60',
      '0x7d754479f40d06180fa1ee66ce1bf0cd97fc156c8f8458e27a18a95b9d1ad46a',
      '0xd8a344e69e7a2adfb31f5e148f99f231e7738019125aef993a760f680f38795b',
      '0xcb30b5e1cf1cec7419554e5aa7ed07c75716d3fbdd0f605b014056b0d99c6079',
      '0xe55fc8aadc1fefe9a2323ab3307bc969779d0acf4e512d8142f392415d4e6162',
      '0xf0a664c8c553278fccbb9bf7a0b6ff79984e1a3fbd28e6e13870c96ceb9befbf',
    ],
  }

  // Forks with different lending semantics are out of scope: 3jane-lending markets carry
  // a creditLine and are undercollateralized by design, so the collateral signals would
  // flag every one. Add a same-semantics fork as { chain, morphoBlue, fromBlock }.
  const EXTRA_TARGETS = []

  // The only historic read. Same target, abi, extraKey and indexer choice the adapter
  // uses, so it hits the warm shared cache rather than replaying the chain.
  async function enumerateMarkets(api, chain, cfg) {
    const { getLogs } = require('../../projects/helper/cache/getLogs')
    const { morphoBlue, fromBlock, onlyUseExistingCache } = cfg
    const args = {
      api, target: morphoBlue, eventAbi: ABI.createMarket, fromBlock,
      onlyArgs: true,
      extraKey: 'reset-v2',
      useIndexer: chain === 'monad',
      onlyUseExistingCache: !!onlyUseExistingCache,
    }
    let logs
    try {
      logs = await getLogs(args)
    } catch (e) {
      logs = await getLogs({ ...args, onlyUseExistingCache: true }) // as the adapter does on tac
    }
    const ids = new Set(logs.map(l => lc(l.id)))
    for (const id of EXTRA_MARKET_IDS[chain] || []) ids.add(lc(id))
    return [...ids]
  }

  async function scanChain(target, opts) {
    const { chain, cfg, knownInsolvent = new Set() } = target
    const api = new sdk.ChainApi({ chain })
    const { morphoBlue } = cfg
    const result = {
      chain,
      blacklisted: new Set((cfg.blacklistedMarketIds || []).map(lc)),
      handledTokens: new Set((cfg.blackList || []).map(lc)),
      markets: [],
      // read this run and carrying nothing at all, so there is nothing left to skip -
      // these count as re-read-and-clean and let a stale stuck entry retire
      emptyMarkets: [],
    }

    const ids = await enumerateMarkets(api, chain, cfg)
    if (!ids.length) {
      result.skipped = `no CreateMarket logs behind ${morphoBlue} - deployment is empty or its log cache is cold`
      return result
    }
    result.enumerated = ids.length

    const [params, states] = await Promise.all([
      api.multiCall({ target: morphoBlue, abi: ABI.idToMarketParams, calls: ids, permitFailure: true }),
      api.multiCall({ target: morphoBlue, abi: ABI.market, calls: ids, permitFailure: true }),
    ])

    const rows = []
    ids.forEach((id, i) => {
      const p = params[i], s = states[i]
      // a null is a call that flaked, not a fact about the market, so the id stays unread
      // and whatever the cache says about it stands
      if (!p || !s) return
      const supply = BigInt(s.totalSupplyAssets)
      const borrow = BigInt(s.totalBorrowAssets)
      if (supply === 0n && borrow === 0n) {
        result.emptyMarkets.push(id)
        return
      }
      rows.push({
        id,
        knownInsolvent: knownInsolvent.has(id),
        loanToken: lc(p.loanToken),
        collateralToken: lc(p.collateralToken) === NULL_ADDRESS ? null : lc(p.collateralToken),
        oracle: isAddress(p.oracle) && lc(p.oracle) !== NULL_ADDRESS ? p.oracle : null,
        supply, borrow,
        shares: BigInt(s.totalSupplyShares),
        lastUpdate: Number(s.lastUpdate),
      })
    })
    if (!rows.length) {
      result.skipped = `${ids.length} markets enumerated, none carry supply or debt`
      return result
    }

    const tokens = [...new Set(rows.flatMap(r => [r.loanToken, r.collateralToken]).filter(Boolean))]
    const [decimals, totalSupplies, held, symbols] = await Promise.all([
      api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true }),
      api.multiCall({ abi: 'erc20:totalSupply', calls: tokens, permitFailure: true }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(t => ({ target: t, params: morphoBlue })), permitFailure: true }),
      api.multiCall({ abi: 'erc20:symbol', calls: tokens, permitFailure: true }),
    ])
    const priceMap = await getPriceMap(chain, tokens)
    const tok = new Map(tokens.map((t, i) => {
      const price = priceMap[t]
      return [t, {
        symbol: symbols[i] || null,
        decimals: price && price.decimals != null ? Number(price.decimals) : (decimals[i] != null ? Number(decimals[i]) : null),
        totalSupply: totalSupplies[i] != null ? BigInt(totalSupplies[i]) : null,
        held: held[i] != null ? BigInt(held[i]) : null,
        price: price && price.price != null ? price.price : null,
      }]
    }))
    const usd = (amount, token) => {
      const t = tok.get(token)
      if (!t || t.price == null || t.decimals == null) return null
      return (Number(amount) / 10 ** t.decimals) * t.price
    }
    const label = (token) => (tok.get(token) || {}).symbol || token
    result.state = {
      morphoBlue, tok, usd,
      byId: new Map(rows.map(r => [r.id, { supply: r.supply, shares: r.shares, loanToken: r.loanToken }])),
    }

    // what suppliers of that loan token can actually claim out of the shared balance
    const idleByToken = new Map()
    for (const r of rows) {
      const idle = r.supply > r.borrow ? r.supply - r.borrow : 0n
      idleByToken.set(r.loanToken, (idleByToken.get(r.loanToken) || 0n) + idle)
    }

    // Interest accrual adds to supply and borrow equally so it cannot open this gap:
    // claims above what the singleton holds means the deployment was drained.
    const custodyByToken = new Map()
    for (const [token, idle] of idleByToken) {
      const t = tok.get(token)
      if (!t || t.held == null || idle === 0n || t.held >= idle) continue
      const gap = idle - t.held
      custodyByToken.set(token, { gap, gapUsd: usd(gap, token), share: Number(gap) / Number(idle) })
    }

    // balanceOf covers collateral for every market on the token plus any loan-side idle
    // liquidity in it, so netting the idle claims out keeps this an upper bound
    const collateralHeld = (token) => {
      const t = tok.get(token)
      if (!t || t.held == null) return null
      const claimed = idleByToken.get(token) || 0n
      return t.held > claimed ? t.held - claimed : 0n
    }

    // the one per-market extra read, so it is made only where it can change a verdict
    const withDebt = rows.filter(r => r.borrow > 0n && r.oracle && !r.knownInsolvent)
    const oraclePrices = withDebt.length
      ? await api.multiCall({ abi: ABI.oraclePrice, calls: withDebt.map(r => r.oracle), permitFailure: true })
      : []
    const oracleByMarket = new Map(withDebt.map((r, i) => [r.id, oraclePrices[i] == null ? null : BigInt(oraclePrices[i])]))

    for (const r of rows) {
      const loan = tok.get(r.loanToken)
      const coll = r.collateralToken ? tok.get(r.collateralToken) : null

      r.expected = r.shares / VIRTUAL_SHARES
      r.realized = r.expected > r.supply ? r.expected - r.supply : 0n
      r.supplyVsPrincipal = r.expected > 0n ? Number(r.supply) / Number(r.expected) : null

      r.oraclePrice = oracleByMarket.has(r.id) ? oracleByMarket.get(r.id) : undefined
      r.oracleUsd = null
      if (r.oraclePrice != null && r.oraclePrice > 0n && loan && loan.price != null
        && loan.decimals != null && coll && coll.decimals != null) {
        r.oracleUsd = (Number(r.oraclePrice) / 10 ** (36 + loan.decimals - coll.decimals)) * loan.price
      }
      r.oracleMult = r.oracleUsd != null && coll && coll.price != null && coll.price > 0
        ? r.oracleUsd / coll.price : null

      r.fictionalDebt = r.knownInsolvent
        || (r.oracleMult != null && r.oracleMult >= opts.oracleMult)
        || (r.supplyVsPrincipal != null && r.supplyVsPrincipal >= opts.interestMult)
    }

    const groups = new Map()
    for (const r of rows) {
      if (!r.collateralToken || r.borrow === 0n || r.fictionalDebt) continue
      if (!groups.has(r.collateralToken)) groups.set(r.collateralToken, { ids: [], debtUsd: 0, priced: true })
      const g = groups.get(r.collateralToken)
      g.ids.push(r.id)
      const d = usd(r.borrow, r.loanToken)
      if (d == null) g.priced = false
      else g.debtUsd += d
    }
    for (const [token, g] of groups) {
      const bound = collateralHeld(token)
      g.collateralUsd = bound == null ? null : usd(bound, token)
      g.shortfallUsd = g.priced && g.collateralUsd != null && g.debtUsd > g.collateralUsd
        ? g.debtUsd - g.collateralUsd : 0
      g.shortfallShare = g.debtUsd > 0 ? g.shortfallUsd / g.debtUsd : 0
    }

    const ts = nowSec()
    for (const r of rows) {
      const loan = tok.get(r.loanToken)
      const coll = r.collateralToken ? tok.get(r.collateralToken) : null
      const inGroup = r.collateralToken && r.borrow > 0n && !r.fictionalDebt
      const group = inGroup ? groups.get(r.collateralToken) : null

      const expected = r.expected
      const realized = r.realized
      const custody = custodyByToken.get(r.loanToken)
      const liquidity = r.supply > r.borrow ? r.supply - r.borrow : 0n

      result.markets.push({
        id: r.id,
        knownInsolvent: r.knownInsolvent,
        collateralToken: r.collateralToken,
        collateralSymbol: r.collateralToken ? label(r.collateralToken) : null,
        handledToken: [r.loanToken, r.collateralToken]
          .filter(t => t && result.handledTokens.has(t)).map(label)[0] || null,
        pair: `${r.collateralToken ? label(r.collateralToken) : '(idle)'}/${label(r.loanToken)}`,
        supplyUsd: usd(r.supply, r.loanToken),
        borrowUsd: usd(r.borrow, r.loanToken),
        liquidityUsd: usd(liquidity, r.loanToken),
        utilization: r.supply > 0n ? Number(r.borrow) / Number(r.supply) : null,
        hasDebt: r.borrow > 0n,

        belowFloor: expected > 0n ? Number(realized) / Number(expected) : 0,
        belowFloorRaw: realized.toString(),
        supplyVsPrincipal: r.supplyVsPrincipal,
        principalUsd: expected > 0n ? usd(expected, r.loanToken) : null,

        shortfallUsd: group ? group.shortfallUsd : 0,
        shortfallShare: group ? group.shortfallShare : 0,
        groupSize: group ? group.ids.length : 0,
        groupDebtUsd: group ? group.debtUsd : null,
        collateralUsd: group ? group.collateralUsd : null,

        custodyGapUsd: custody ? custody.gapUsd : null,
        custodyGapRaw: custody ? custody.gap.toString() : null,
        custodyShare: custody ? custody.share : 0,
        loanSymbol: label(r.loanToken),

        debtVsLoanSupply: loan && loan.totalSupply != null && loan.totalSupply > 0n
          ? Number(r.borrow) / Number(loan.totalSupply) : null,

        oracleMult: r.oracleMult,
        oracleUsd: r.oracleUsd, collateralPrice: coll ? coll.price : null,
        // undefined means we never asked (no debt / no oracle); null means it failed
        oracleDown: r.oraclePrice === undefined ? false : (r.oraclePrice == null || r.oraclePrice === 0n),

        collateralGone: !!(coll && coll.totalSupply === 0n),
        collateralUnpriced: !!(coll && coll.price == null),

        staleDays: r.lastUpdate > 0 ? (ts - r.lastUpdate) / 86400 : null,
      })
    }

    return result
  }

  function classify(m, opts) {
    const signals = []
    const minGap = opts.gapBps / 10000
    const big = (usd) => usd == null || usd >= opts.minUsd // unpriced passes and gets tagged

    const pinned = m.utilization != null && m.utilization >= opts.util
    const dust = m.liquidityUsd != null && m.liquidityUsd < opts.dustUsd && m.hasDebt
    const exitless = pinned || dust

    if (m.belowFloor >= minGap && big(m.supplyUsd)) {
      signals.push(`bad debt written off: share price ${fmtPct(m.belowFloor)} below its floor, ${fmtUsd(m.supplyUsd)} supply still in the market`)
    }

    if (m.collateralGone && m.hasDebt && big(m.borrowUsd)) {
      signals.push(`collateral totalSupply is 0 (asset retired/migrated) with ${fmtUsd(m.borrowUsd)} debt outstanding`)
    } else if (!m.collateralGone) {
      if (m.shortfallUsd >= opts.minUsd && m.shortfallShare >= minGap && m.groupSize === 1) {
        signals.push(`collateral shortfall ${fmtUsd(m.shortfallUsd)} (${fmtUsd(m.groupDebtUsd)} debt vs ${fmtUsd(m.collateralUsd)} collateral held)`)
      }

      if (m.oracleMult != null && m.oracleMult >= opts.oracleMult && big(m.borrowUsd)) {
        signals.push(`oracle prices collateral at ${fmtMult(m.oracleMult)} market ($${m.oracleUsd.toPrecision(4)} vs $${m.collateralPrice.toPrecision(4)})`)
      }
    }
    if (m.custodyShare >= minGap && big(m.custodyGapUsd)) {
      signals.push(`custody gap ${fmtSize(m.custodyGapUsd, m.custodyGapRaw)} on ${m.loanSymbol} (${fmtPct(m.custodyShare)} of idle liquidity)`)
    }
    if (exitless && m.debtVsLoanSupply != null && m.debtVsLoanSupply >= opts.supplyMult) {
      signals.push(`unrepayable (${fmtMult(m.debtVsLoanSupply)} loan token supply)`)
    }

    const phantomUsd = m.supplyUsd != null && m.principalUsd != null ? m.supplyUsd - m.principalUsd : null
    if (exitless && m.supplyVsPrincipal != null && m.supplyVsPrincipal >= opts.interestMult && big(phantomUsd)) {
      signals.push(`phantom interest: ${fmtUsd(m.supplyUsd)} supply is ${fmtMult(m.supplyVsPrincipal)} the ${fmtUsd(m.principalUsd)} principal, none of it withdrawable`)
    }

    const proven = signals.length > 0
    if (!proven) {

      const material = m.borrowUsd != null && m.borrowUsd >= opts.minUsd
      if (!m.collateralGone && m.shortfallUsd >= opts.minUsd && m.shortfallShare >= minGap
        && m.groupSize > 1 && material) {
        signals.push(`collateral shortfall ${fmtUsd(m.shortfallUsd)} shared across ${m.groupSize} markets on this collateral (review - not attributable to one id)`)
      }
      if (m.collateralUnpriced && material) {
        signals.push(`collateral unpriced against ${fmtUsd(m.borrowUsd)} of debt (possible inflation - review)`)
      }

      if (m.oracleDown && material) {
        signals.push(`oracle price() unavailable with ${fmtUsd(m.borrowUsd)} debt outstanding (unliquidatable)`)
      }

      if (exitless && material) {
        const stale = m.staleDays != null && m.staleDays >= opts.staleDays
        const large = m.supplyUsd != null && m.supplyUsd >= opts.frozenUsd
        if (stale) signals.push(`frozen: ${fmtPct(m.utilization)} util, ${fmtUsd(m.liquidityUsd)} withdrawable, untouched ${m.staleDays.toFixed(0)}d`)
        else if (large) signals.push(`frozen: ${fmtPct(m.utilization)} util, ${fmtUsd(m.liquidityUsd)} withdrawable on a ${fmtUsd(m.supplyUsd)} market`)
      }
    }
    if (!signals.length) return null

    const debtUsd = m.debtVsLoanSupply != null && m.debtVsLoanSupply >= 1
      ? `${fmtUsd(m.borrowUsd)} notional` : fmtUsd(m.borrowUsd)
    return {
      verdict: proven ? 'INSOLVENT' : 'STUCK',
      reason: `${m.pair} — ${signals.join(' + ')} — ${debtUsd} debt at ${fmtPct(m.utilization)} util`,
    }
  }

  const HANDLED_TAG = '[already excluded by the adapter'
  const tagged = (why, reason) => why ? `${HANDLED_TAG}: ${why}] ${reason}` : reason

  function buildOutput(results, errors, opts) {
    const out = { insolvent: {}, stuck: {}, tokens: {}, vaults: {}, vaultSignals: {} }
    const clean = new Set()
    const adapterFlagged = new Set()
    const insolventIds = new Set()
    const put = (bucket, chain, key, reason) => {
      if (!out[bucket][chain]) out[bucket][chain] = {}
      out[bucket][chain][key] = reason
    }
    for (const r of results) {
      if (!r) continue
      for (const id of r.emptyMarkets || []) clean.add(`${r.chain}|${id}`)
      if (r.error) { errors.push(`morpho · ${r.chain}: ${r.error}`); continue }
      if (r.skipped) { errors.push(`morpho · ${r.chain}: ${r.skipped}`); continue }

      const handledWhy = (m) => r.blacklisted.has(m.id) ? 'id in blacklistedMarketIds'
        : m.handledToken ? `${m.handledToken} in blackList` : null

      const flagged = []
      for (const m of r.markets) {
        if (m.knownInsolvent) { insolventIds.add(`${r.chain}|${m.id}`); continue }
        const c = classify(m, opts)
        if (!c) { clean.add(`${r.chain}|${m.id}`); continue }
        if (c.verdict === 'INSOLVENT') insolventIds.add(`${r.chain}|${m.id}`)
        flagged.push({ m, c })
      }

      const byCollateral = new Map()
      for (const f of flagged) {
        if (!f.m.collateralToken) continue
        if (!byCollateral.has(f.m.collateralToken)) byCollateral.set(f.m.collateralToken, [])
        byCollateral.get(f.m.collateralToken).push(f)
      }
      const clustered = new Set()
      for (const [token, members] of byCollateral) {
        if (members.length < opts.cluster) continue
        members.forEach(f => clustered.add(f.m.id))
        const worst = members.some(f => f.c.verdict === 'INSOLVENT') ? 'INSOLVENT' : 'STUCK'
        const why = r.handledTokens.has(token) ? `${members[0].m.collateralSymbol} in blackList` : null
        if (why) adapterFlagged.add(`${r.chain}|${token}`)
        put('tokens', r.chain, token, tagged(why, `${members[0].m.collateralSymbol}: ${members.length} flagged markets on this collateral (${worst}) — blacklist the token rather than the ids — e.g. ${members[0].c.reason}`))
      }

      for (const { m, c } of flagged) {
        if (clustered.has(m.id)) continue
        const why = handledWhy(m)
        if (why) adapterFlagged.add(`${r.chain}|${m.id}`)
        put(c.verdict === 'INSOLVENT' ? 'insolvent' : 'stuck', r.chain, m.id, tagged(why, c.reason))
      }
    }
    out.clean = clean
    out.adapterFlagged = adapterFlagged
    out.insolventIds = insolventIds
    return out
  }

  async function mapAdapters(api, vaults) {
    const adapterOwner = new Map()
    const v1Of = new Map()
    const v2Set = new Set()

    const liquidity = await api.multiCall({ abi: VAULT_ABI.liquidityAdapter, calls: vaults, permitFailure: true })
    const v2 = []
    vaults.forEach((vault, i) => {
      if (!isAddress(liquidity[i]) || lc(liquidity[i]) === NULL_ADDRESS) return // v1 answers nothing
      v2.push({ vault, liquidityAdapter: lc(liquidity[i]) })
      v2Set.add(vault)
    })
    if (!v2.length) return { adapterOwner, v1Of, v2Set }

    for (const v of v2) adapterOwner.set(v.liquidityAdapter, v.vault) // not always in adapters()

    // the whole list where the length reads, else adapters(0) alone - curators' fallback
    const lengths = await api.multiCall({ abi: VAULT_ABI.adaptersLength, calls: v2.map(v => v.vault), permitFailure: true })
    const slots = []
    v2.forEach((v, i) => {
      const count = lengths[i] == null ? 1 : Math.min(Number(lengths[i]), MAX_ADAPTERS)
      for (let k = 0; k < count; k++) slots.push({ vault: v.vault, k })
    })
    const found = slots.length
      ? await api.multiCall({ abi: VAULT_ABI.adapters, calls: slots.map(s => ({ target: s.vault, params: [s.k] })), permitFailure: true })
      : []
    slots.forEach((s, i) => {
      if (!isAddress(found[i]) || lc(found[i]) === NULL_ADDRESS) return
      adapterOwner.set(lc(found[i]), s.vault)
    })

    const adapters = [...adapterOwner.keys()]
    const wrapped = await api.multiCall({ abi: VAULT_ABI.morphoVaultV1, calls: adapters, permitFailure: true })
    adapters.forEach((a, i) => {
      if (isAddress(wrapped[i]) && lc(wrapped[i]) !== NULL_ADDRESS) v1Of.set(a, lc(wrapped[i]))
    })
    return { adapterOwner, v1Of, v2Set }
  }

  async function readQueues(api, vaults) {
    const queueOf = new Map()
    const unverified = new Set()
    if (!vaults.length) return { queueOf, unverified }

    const lengths = await api.multiCall({ abi: VAULT_ABI.withdrawQueueLength, calls: vaults, permitFailure: true })
    const slots = []
    vaults.forEach((vault, i) => {
      if (lengths[i] == null) { unverified.add(vault); return }
      queueOf.set(vault, new Set())
      for (let k = 0; k < Math.min(Number(lengths[i]), MAX_QUEUE); k++) slots.push({ vault, k })
    })
    const ids = slots.length
      ? await api.multiCall({ abi: VAULT_ABI.withdrawQueue, calls: slots.map(s => ({ target: s.vault, params: [s.k] })), permitFailure: true })
      : []
    slots.forEach((s, i) => {
      if (ids[i] == null) { unverified.add(s.vault); return } // a partial queue would read as a drop
      queueOf.get(s.vault).add(lc(ids[i]))
    })
    for (const vault of unverified) queueOf.delete(vault)
    return { queueOf, unverified }
  }

  async function gradeVaults(r, badIds, fresh, opts) {
    const { getMorphoVaults } = require('../../projects/helper/curators')
    const { chain, state } = r
    const api = new sdk.ChainApi({ chain })

    const vaults = [...new Set((await getMorphoVaults(api, undefined, {
      getAllVaults: true,
      onlyUseExistingCache: chain === 'sei',
    })).filter(isAddress).map(lc))]
    if (!vaults.length) return 0 // no vault factory configured for this chain

    const { adapterOwner, v1Of, v2Set } = await mapAdapters(api, vaults)
    const holders = [...vaults, ...adapterOwner.keys()]

    let positions = []
    if (badIds.length) {
      positions = await api.multiCall({
        target: state.morphoBlue, abi: ABI.position, permitFailure: true,
        calls: badIds.flatMap(id => holders.map(h => ({ params: [id, h] }))),
      })
      // an all-null read is a multicall that flaked, not a chain where nobody is exposed; retiring
      // every stored vault on the strength of it would clear the cache for the wrong reason
      if (!positions.some(p => p != null)) throw new Error('position() answered for no holder at all')
    }

    const exposure = new Map() // vault -> { usd, ids }
    const bump = (vault, usd, ids) => {
      if (!(usd > 0)) return
      if (!exposure.has(vault)) exposure.set(vault, { usd: 0, ids: new Set() })
      const e = exposure.get(vault)
      e.usd += usd
      for (const id of ids) e.ids.add(id)
    }

    const held = []
    badIds.forEach((id, i) => {
      const m = state.byId.get(id)
      holders.forEach((holder, j) => {
        const p = positions[i * holders.length + j]
        if (!p) return
        const shares = BigInt(p.supplyShares)
        if (shares === 0n) return
        held.push({ holder, id, token: m.loanToken, assets: shares * (m.supply + 1n) / (m.shares + VIRTUAL_SHARES) })
      })
    })

    const { queueOf, unverified } = await readQueues(
      api, [...new Set(held.map(h => h.holder))].filter(h => !v2Set.has(h) && !adapterOwner.has(h)))

    for (const h of held) {
      if (unverified.has(h.holder)) continue
      const queue = queueOf.get(h.holder)
      if (queue && !queue.has(h.id)) continue // dropped from the queue - already out of totalAssets
      bump(adapterOwner.get(h.holder) || h.holder, state.usd(h.assets, h.token), [h.id])
    }

    const totals = new Map() // vault -> { asset, usd }
    const readTotals = async (list) => {
      const need = [...new Set(list)].filter(v => !totals.has(v))
      if (!need.length) return
      const [assets, amounts, lost] = await Promise.all([
        api.multiCall({ abi: VAULT_ABI.asset, calls: need, permitFailure: true }),
        api.multiCall({ abi: VAULT_ABI.totalAssets, calls: need, permitFailure: true }),
        api.multiCall({ abi: VAULT_ABI.lostAssets, calls: need, permitFailure: true }),
      ])
      const unpriced = [...new Set(assets.filter(isAddress).map(lc))].filter(a => !state.tok.has(a))
      if (unpriced.length) {
        const [decimals, prices] = await Promise.all([
          api.multiCall({ abi: 'erc20:decimals', calls: unpriced, permitFailure: true }),
          getPriceMap(chain, unpriced),
        ])
        unpriced.forEach((token, i) => {
          const price = prices[token]
          state.tok.set(token, {
            symbol: null, totalSupply: null, held: null,
            decimals: price && price.decimals != null ? Number(price.decimals) : (decimals[i] != null ? Number(decimals[i]) : null),
            price: price && price.price != null ? price.price : null,
          })
        })
      }
      need.forEach((vault, i) => {
        if (!isAddress(assets[i]) || amounts[i] == null) return
        const asset = lc(assets[i])
        totals.set(vault, {
          asset,
          usd: state.usd(BigInt(amounts[i]), asset),
          lostUsd: lost[i] == null ? null : state.usd(BigInt(lost[i]), asset),
        })
      })
    }

    await readTotals(vaults)

    const inherited = new Map()
    const inherit = (vault, usd, v1) => {
      if (!(usd > 0)) return
      if (!inherited.has(vault)) inherited.set(vault, { usd: 0, from: new Set() })
      const e = inherited.get(vault)
      e.usd += usd
      e.from.add(v1)
    }
    const wrappers = [...v1Of].filter(([, v1]) => {
      const t = totals.get(v1)
      return t && (exposure.has(v1) || t.lostUsd > 0)
    })
    if (wrappers.length) {
      const shares = await api.multiCall({
        abi: VAULT_ABI.balanceOf, permitFailure: true,
        calls: wrappers.map(([adapter, v1]) => ({ target: v1, params: [adapter] })),
      })
      const claims = await api.multiCall({
        abi: VAULT_ABI.convertToAssets, permitFailure: true,
        calls: wrappers.map(([, v1], i) => ({ target: v1, params: [shares[i] || 0] })),
      })
      wrappers.forEach(([adapter, v1], i) => {
        const owner = adapterOwner.get(adapter)
        const total = totals.get(v1)
        if (!owner || claims[i] == null || !(total.usd > 0)) return
        const claimUsd = state.usd(BigInt(claims[i]), total.asset)
        if (!(claimUsd > 0)) return
        const pos = exposure.get(v1)
        const bad = (pos ? pos.usd : 0) + (total.lostUsd > 0 ? total.lostUsd : 0)
        inherit(owner, bad * Math.min(1, claimUsd / total.usd), v1)
      })
    }

    const gate = opts.vaultShareBps / 10000
    const flagged = []
    for (const vault of vaults) {
      const total = totals.get(vault)
      if (!total || !(total.usd > 0)) continue 
      const e = exposure.get(vault)
      const inh = inherited.get(vault)
      const posUsd = e ? e.usd : 0
      const lostUsd = total.lostUsd > 0 ? total.lostUsd : 0
      const inhUsd = inh ? inh.usd : 0
      const raw = posUsd + lostUsd + inhUsd
      if (raw <= 0) continue
      const share = Math.min(1, raw / total.usd)
      const usd = Math.min(raw, total.usd)
      if (usd >= opts.minUsd && share >= gate) {
        flagged.push({ vault, usd, share, lostUsd, posUsd, inhUsd, ids: e ? [...e.ids] : [], wraps: inh ? [...inh.from] : [] })
      }
    }

    const names = flagged.length
      ? await api.multiCall({ abi: VAULT_ABI.name, calls: flagged.map(f => f.vault), permitFailure: true })
      : []
    flagged.forEach((f, i) => {
      if (!fresh.vaults[chain]) fresh.vaults[chain] = {}
      // what the date backfill needs, kept as data rather than parsed back out of the reason
      if (!fresh.vaultSignals[chain]) fresh.vaultSignals[chain] = {}
      fresh.vaultSignals[chain][f.vault] = {
        lost: f.lostUsd > 0, ids: f.ids, wraps: f.wraps, morphoBlue: state.morphoBlue,
      }
      const parts = []
      const multi = [f.lostUsd, f.posUsd, f.inhUsd].filter(x => x > 0).length > 1
      const amt = (x) => multi ? `${fmtUsd(x)} ` : ''
      if (f.lostUsd > 0) parts.push(`${amt(f.lostUsd)}lostAssets (bad debt already realized, still counted)`)
      if (f.posUsd > 0) {
        parts.push(`${amt(f.posUsd)}supplied into ${f.ids.length} insolvent market${f.ids.length === 1 ? '' : 's'} (${f.ids.map(id => `${id.slice(0, 10)}…`).join(', ')})`)
      }
      if (f.inhUsd > 0) {
        parts.push(`${amt(f.inhUsd)}inherited through its adapter from ${f.wraps.length} overstated vault${f.wraps.length === 1 ? '' : 's'} it wraps (${f.wraps.map(v => `${v.slice(0, 10)}…`).join(', ')})`)
      }
      const bound = f.posUsd > 0 || f.inhUsd > 0 ? 'up to ' : ''
      const total = f.lostUsd + f.posUsd + f.inhUsd
      const capped = total > f.usd ? `, capped at totalAssets from ${fmtUsd(total)}` : ''
      fresh.vaults[chain][f.vault] = `${(names[i] || '').trim() || f.vault}: ${bound}${fmtUsd(f.usd)} (${fmtPct(f.share)} of totalAssets${capped}) — ${parts.join(' + ')}`
    })

    const isFlagged = new Set(flagged.map(f => f.vault))
    for (const vault of vaults) {
      if (!isFlagged.has(vault) && !unverified.has(vault)) fresh.clean.add(`${chain}|${vault}`)
    }
    return vaults.length
  }

  // ---- date archaeology --------------------------------------------------------------------
  // Everything above reads current state. These three read history, which is why they are opt-in
  // and run once: a vault discovered later is stamped with its discovery date like anything else.

  // First block where `test` starts holding and never stops. `test` answers null where the node
  // cannot serve that block, and public archives rarely reach Blue's 2023 deployment - so the
  // usable floor is discovered by doubling back from the head rather than assumed. A null in the
  // middle of the bisection aborts: converging on an archive boundary would invent a date.
  async function firstBlockWhere(floor, hi, test) {
    const atHi = await test(hi)
    if (atHi == null) return { error: 'head read failed' }
    if (!atHi) return { error: 'condition does not hold now, so there is no onset to find' }

    let lo = null, step = 100000, deepestTrue = hi
    while (hi - step > floor) {
      const probe = hi - step
      const v = await test(probe)
      if (v === false) { lo = probe; break }
      if (v == null) break
      deepestTrue = probe
      step *= 2
    }
    if (lo == null && (await test(floor)) === false) lo = floor
    if (lo == null) return { error: `already true at block ${deepestTrue}, as far back as this node serves` }

    hi = deepestTrue // the onset is at or before the deepest block that still tested true
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2)
      const v = await test(mid)
      if (v == null) return { error: `no state at block ${mid} - archive coverage is incomplete` }
      if (v) hi = mid; else lo = mid
    }
    return { block: hi }
  }

  async function readAt(chain, block, call) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await new sdk.ChainApi({ chain, block }).call(call)
      } catch (e) {
        if (attempt >= 2) return null
        await new Promise(r => setTimeout(r, 400 * (attempt + 1)))
      }
    }
  }

  const lostAssetsOnset = (chain, vault) => (block) =>
    readAt(chain, block, { target: vault, abi: VAULT_ABI.lostAssets })
      .then(v => v == null ? null : BigInt(v) > 0n)

  const marketOnset = (chain, morphoBlue, id, interestMult) => (block) =>
    readAt(chain, block, { target: morphoBlue, abi: ABI.market, params: [id] }).then(m => {
      if (!m) return null
      const shares = BigInt(m.totalSupplyShares)
      if (shares === 0n) return false
      const r = Number(BigInt(m.totalSupplyAssets)) * Number(VIRTUAL_SHARES) / Number(shares)
      return r < 1 || r >= interestMult
    })

  const positionOnset = (chain, morphoBlue, id, vault) => (block) =>
    readAt(chain, block, { target: morphoBlue, abi: ABI.position, params: [id, vault] })
      .then(p => p == null ? null : BigInt(p.supplyShares) > 0n)

  async function backfillVaultDates(merged, fresh, opts, errors, io, stampedAt) {
    const { config } = require('../../projects/morpho-blue/config')
    const seen = merged.firstSeen
    const targets = []
    for (const [chain, entries] of Object.entries(merged.vaults || {})) {
      for (const vault of Object.keys(entries)) {
        const had = ((seen.vaults || {})[chain] || {})[vault]
        if (had != null && had !== stampedAt) continue
        const sig = (fresh.vaultSignals[chain] || {})[vault]
        if (!sig) continue
        targets.push({ chain, vault, sig })
      }
    }
    if (!targets.length) return

    const heads = {}
    const marketCache = new Map()
    let dug = 0, approx = 0

    const results = await mapLimit(targets, opts.concurrency, async ({ chain, vault, sig }) => {
      const cfg = config[chain]
      if (!cfg) return null
      const lo = cfg.fromBlock
      try {
        if (heads[chain] == null) heads[chain] = await new sdk.ChainApi({ chain }).getBlock()
        const hi = heads[chain]
        const found = []

        if (sig.lost) {
          const r = await firstBlockWhere(lo, hi, lostAssetsOnset(chain, vault))
          if (r.block) found.push({ block: r.block, exact: true })
          else errors.push(`morpho · ${chain}: ${vault} lostAssets onset not datable - ${r.error}`)
        }
        for (const id of sig.ids) {
          const key = `${chain}|${id}`
          if (!marketCache.has(key)) {
            marketCache.set(key, firstBlockWhere(lo, hi, marketOnset(chain, sig.morphoBlue, id, opts.interestMult)))
          }
          const r = await marketCache.get(key)
          if (r.block) { found.push({ block: r.block, exact: true }); continue }
          const p = await firstBlockWhere(lo, hi, positionOnset(chain, sig.morphoBlue, id, vault))
          if (p.block) found.push({ block: p.block, exact: false })
          else errors.push(`morpho · ${chain}: ${vault} vs ${id.slice(0, 10)}… not datable - ${r.error}`)
        }
        if (!found.length) return null
        // the vault went bad when the first of its reasons did
        const best = found.reduce((a, b) => b.block < a.block ? b : a)
        return { chain, vault, ...best }
      } catch (e) {
        errors.push(`morpho · ${chain}: ${vault} date search failed - ${rpcMessage(e)}`)
        return null
      }
    })

    const stamps = results.filter(Boolean)
    const times = {}
    for (const { chain, block } of stamps) {
      if (!times[chain]) times[chain] = {}
      if (times[chain][block] == null) {
        const b = await new sdk.ChainApi({ chain }).provider.getBlock(block).catch(() => null)
        times[chain][block] = b ? Number(b.timestamp) : null
      }
    }
    const dated = new Set()
    for (const { chain, vault, block, exact } of stamps) {
      const ts = times[chain][block]
      if (ts == null) continue
      if (!seen.vaults) seen.vaults = {}
      if (!seen.vaults[chain]) seen.vaults[chain] = {}
      seen.vaults[chain][vault] = ts
      dated.add(`${chain}|${vault}`)
      exact ? dug++ : approx++
    }

    let inheritedDates = 0
    for (const { chain, vault, sig } of targets) {
      if (dated.has(`${chain}|${vault}`) || !(sig.wraps || []).length) continue
      const from = sig.wraps.map(v1 => ((seen.vaults || {})[chain] || {})[v1]).filter(t => typeof t === 'number')
      if (!from.length) continue
      if (!seen.vaults[chain]) seen.vaults[chain] = {}
      seen.vaults[chain][vault] = Math.min(...from)
      dated.add(`${chain}|${vault}`)
      inheritedDates++
    }

    let undated = 0
    for (const { chain, vault } of targets) {
      if (dated.has(`${chain}|${vault}`)) continue
      if (((seen.vaults || {})[chain] || {})[vault] !== stampedAt) continue
      delete seen.vaults[chain][vault]
      if (!Object.keys(seen.vaults[chain]).length) delete seen.vaults[chain]
      undated++
    }

    io.note(`morpho: backfilled ${dug + approx + inheritedDates} vault dates from chain history` +
      (approx ? `, ${approx} dated by deposit rather than damage (oracle-only market)` : '') +
      (inheritedDates ? `, ${inheritedDates} taken from the vault they wrap` : '') +
      (undated ? `; ${undated} left undated - history does not reach their onset` : ''))
  }

  async function resolveVaults(results, fresh, opts, errors, io) {
    const targets = []
    for (const r of results) {
      if (!r || !r.state) continue
      const prefix = `${r.chain}|`
      const badIds = [...fresh.insolventIds]
        .filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length))
        .filter(id => r.state.byId.has(id))
      targets.push({ r, badIds })
    }
    if (!targets.length) return

    const counts = await mapLimit(targets, opts.concurrency, async ({ r, badIds }) => {
      try {
        return await gradeVaults(r, badIds, fresh, opts)
      } catch (e) {
        errors.push(`morpho · ${r.chain}: vault exposure not resolved - ${rpcMessage(e)}`)
        return 0
      }
    })
    const scanned = counts.reduce((n, c) => n + (c || 0), 0)
    const withIds = targets.filter(t => t.badIds.length).length
    io.note(`morpho: ${scanned} vaults checked on ${targets.length} chain(s), ${withIds} of them also against insolvent markets`)
  }

  async function run(opts, io) {
    const errors = []
    guardFresh(opts, 'morpho')

    const prior = await loadPrior(CACHE, BUCKETS, opts)
    const known = (chain) => new Set(Object.keys(prior.insolvent[chain] || {}))

    const { config } = require('../../projects/morpho-blue/config')
    const targets = []
    for (const [chain, cfg] of Object.entries(config)) {
      if (opts.chains.length && !opts.chains.includes(chain)) continue
      targets.push({ chain, cfg, knownInsolvent: known(chain) })
    }
    for (const t of EXTRA_TARGETS) {
      if (opts.chains.length && !opts.chains.includes(t.chain)) continue
      targets.push({ chain: t.chain, cfg: t, knownInsolvent: known(t.chain) })
    }
    if (!targets.length) throw new Error(`no Morpho Blue deployment for chain(s): ${opts.chains.join(', ')}`)

    const results = await runScans({
      targets, opts, scan: scanChain,
      label: (t) => t.chain,
      onError: (t, error) => ({ chain: t.chain, blacklisted: new Set(), handledTokens: new Set(), markets: [], emptyMarkets: [], error }),
    })
    const scanned = results.reduce((n, r) => n + ((r && r.markets.length) || 0), 0)
    const enumerated = results.reduce((n, r) => n + ((r && r.enumerated) || 0), 0)
    io.note(`morpho: ${targets.length} deployments, ${enumerated} markets enumerated, ${scanned} with supply or debt scanned`)

    const fresh = buildOutput(results, errors, opts)
    await resolveVaults(results, fresh, opts, errors, io)
    const { state: merged, delta, stampedAt } = mergeBuckets({
      prior, run: fresh, buckets: BUCKETS, monotonic: MONOTONIC,
      refreshReasons: false, // re-deriving the numbers is the work this cache exists to avoid
      wasReRead: (chain, key) => fresh.clean.has(`${chain}|${key}`),
    })
    if (opts.backfillFirstSeen) await backfillVaultDates(merged, fresh, opts, errors, io, stampedAt)
    const state = { updatedAt: nowSec(), ...merged, errors }

    return publish({
      name: 'morpho', cache: CACHE, buckets: BUCKETS, monotonic: MONOTONIC,
      state, delta, errors, opts, io, adapterExcluded: fresh.adapterFlagged,
    })
  }

  return { name: 'morpho', cache: CACHE, defaults: DEFAULTS, run }
})()

// ###########################################################################
// ##  DISPATCH
// ###########################################################################

const FAMILIES = [AAVE, COMPOUND, MORPHO]
const ALIASES = { 'morpho-blue': 'morpho', aavev3: 'aave', comet: 'compound' }

function selectFamilies(requested) {
  if (!requested.length || requested.includes('all')) return FAMILIES
  const picked = []
  for (const raw of requested) {
    const name = ALIASES[raw] || raw
    const family = FAMILIES.find(f => f.name === name)
    if (!family) throw new Error(`unknown family '${raw}' - pick from ${FAMILIES.map(f => f.name).join(', ')}, or all`)
    if (!picked.includes(family)) picked.push(family)
  }
  return picked
}

async function main() {
  const { families: requested, opts: explicit } = parseArgs(process.argv.slice(2))
  const families = selectFamilies(requested)

  const docs = {}
  for (const family of families) {
    const opts = { ...family.defaults, ...explicit }
    try {
      docs[family.name] = await family.run(opts, io)
    } catch (e) {
      // one family failing shouldn't cost the others their scan; on its own it is the
      // whole run, so let it fail the process rather than print an empty document
      if (families.length === 1) throw e
      io.note(`${family.name}: FAILED - ${e.message}`)
      docs[family.name] = { error: e.message }
    }
  }

  const json = JSON.stringify(families.length === 1 ? docs[families[0].name] : docs, null, 2)
  await new Promise((resolve, reject) => process.stdout.write(`${json}\n`, e => e ? reject(e) : resolve()))
}

main().then(() => process.exit(0), e => { console.error(e); process.exit(1) })
