// Perpsplexity: leveraged meme pools and leveraged tokens on Sui, backed by perpetual positions on Aftermath.
// Every pool and token is valued by its own contract through a read-only call (devInspect) on the latest state.
const sdk = require('@defillama/sdk')
const sui = require('../helper/chain/sui')

const suiSdk = sdk.chains.sui
const CLOCK = '0x6'

// One entry per deployed package line. `original` is the first publish (event and object types carry it);
// view calls go to the newest version of that line, looked up on chain. `layout` picks the reader below.
// Adding a new generation (for example the v2 pools) is one more entry here plus, if its objects differ, a reader.
const DEPLOYMENTS = [
  { version: 'v1-immutable', layout: 'core1', original: '0xaedb8c9a905a778e831aeb4928f660210a7a645925348a7c4ec1cb4a6a3fd16e', config: '0xb57be7c2f90d8bf9232af4cb967b411861b713f4480dfe50871dc85579f98411' },
  { version: 'v1', layout: 'core1', original: '0x97fea95545c04dc73f8174c6195013b100a26e3fa978e7cf8b100a51dfaf8354', config: '0x7566f0f6508b7797f906c78ae5a39aaf1cd5aec58ff765b2599a6fba1dfce12c' },
  { version: 'lev', layout: 'lev', original: '0x294e0968e465d9e2e560b825c603a40d34a7ee72e5a9157ff796519d44f7df4a', config: '0xfa003af67a3c948d1ebf9bbde1b08da54bee838d92ce577046fbc8fdc7d15cb4' },
]

// Object types each layout lists. Pools and tokens are shared objects, so listing them by type needs no event history.
const OBJECT_TYPES = {
  core1: ['composite_pool::CompositePool', 'pool::Pool'],
  lev: ['token::LevToken'],
}

// ---------------------------------------------------------------- chain reads

/** Objects with their json, type and initial shared version, 50 per GraphQL query. */
async function loadObjects(ids, cache) {
  const missing = [...new Set(ids.map(normalize))].filter(id => !cache.has(id))
  for (let i = 0; i < missing.length; i += 50) {
    const chunk = missing.slice(i, i + 50)
    const keys = chunk.map(id => `{ address: "${id}" }`).join(', ')
    const data = await suiSdk.graphqlCall({
      query: `{ multiGetObjects(keys: [${keys}]) { address owner { ... on Shared { initialSharedVersion } } asMoveObject { contents { type { repr } json } } } }`,
    })
    for (const o of data.multiGetObjects ?? []) {
      if (!o?.address) continue
      cache.set(normalize(o.address), {
        type: o.asMoveObject?.contents?.type?.repr,
        json: o.asMoveObject?.contents?.json,
        isv: o.owner?.initialSharedVersion,
      })
    }
  }
  return ids.map(id => cache.get(normalize(id)))
}

/** Newest package version of a package line (view calls go there). */
async function latestPackage(original) {
  const data = await suiSdk.graphqlCall({ query: `{ packageVersions(address: "${original}", last: 1) { nodes { address } } }` })
  return data.packageVersions?.nodes?.[0]?.address ?? original
}

/** Read-only Move call over shared objects; returns the BCS bytes of each return value, or null if it aborts. */
async function view(cache, packageId, module, functionName, typeArguments, args) {
  const objs = await loadObjects(args.map(a => a.id), cache)
  const sharedObjects = args.map((a, i) => {
    if (objs[i]?.isv == null) throw new Error(`${a.id} is not a shared object`)
    return { objectId: a.id, initialSharedVersion: objs[i].isv, mutable: !!a.mut }
  })
  const txBytes = sui.buildProgrammableMoveCallBytes({ packageId, module, functionName, typeArguments, sharedObjects })
  try {
    const res = await sui.devInspectTransactionBlock(txBytes)
    return (res?.results?.[0]?.returnValues ?? []).map(v => v[0])
  } catch (e) {
    sdk.log(`[perpsplexity] ${module}::${functionName} aborted: ${String(e?.message ?? e).slice(0, 200)}`)
    return null
  }
}

// ---------------------------------------------------------------- readers, one per object layout

// composite_pool::Health: pool, engine, market (3 x ID), timestamp_ms u64, state u8, config_paused bool,
// last_epoch_ms u64, epoch_interval_ms u64, meme_reserve u64, then quote_nav u64 at byte 130.
const HEALTH_QUOTE_NAV = 130
// token::Status: token ID, state u8, long bool, target_bps, min_bps, max_bps (u64), then nav u64 at byte 58.
const STATUS_NAV = 58

const big = v => BigInt(v ?? 0)

/** Coins the pool keeps apart from its curve: treasury, unpaid dividends, platform fees and the launch escrow. */
function setApart(json) {
  return big(json.treasury?.funds) + big(json.dividends) + big(json.platform) + big(json.pending_seed)
}

async function creatorFees(cache, pkg, module, typeArgs, id) {
  const out = await view(cache, pkg, module, 'creator_fees', typeArgs, [{ id }])
  return out?.[1] ? sui.fromU64(out[1]) : 0n
}

/** Leveraged pool (composite_pool::CompositePool<M, P, Q>): quote_nav from observe / observe_cash, plus what it keeps apart. */
async function compositePool(api, cache, pkg, id, obj) {
  const typeArgs = sui.parseStructTag(obj.type).typeParams
  const quote = typeArgs[2]
  const p = obj.json
  const state = Number(p.state)
  let total = setApart(p) + await creatorFees(cache, pkg, 'composite_pool', typeArgs, id)
  // 3: being set up (seed sits in pending_seed), 4: cancelled
  if (state !== 3 && state !== 4) {
    const q = p.quote
    const cash = state === 2 || state === 6
    let args
    if (cash) {
      const [reserve] = await loadObjects([q.reserve], cache)
      args = [{ id }, { id: p.config }, { id: q.sleeve }, { id: q.reserve }, { id: reserve.json.account_id }, { id: q.lending_market }, { id: q.market }, { id: CLOCK }]
    } else {
      const [engine, reserve] = await loadObjects([q.engine, q.reserve], cache)
      const e = engine.json
      const [vault] = await loadObjects([e.vault], cache)
      args = [
        { id }, { id: p.config }, { id: q.engine }, { id: e.vault }, { id: vault.json.account_id }, { id: q.market, mut: true }, { id: e.sleeve },
        { id: q.lending_market }, { id: q.sleeve }, { id: q.reserve }, { id: reserve.json.account_id }, { id: q.registry }, { id: e.base_oracle }, { id: e.collateral_oracle }, { id: CLOCK },
      ]
    }
    const out = await view(cache, pkg, 'composite_pool', cash ? 'observe_cash' : 'observe', typeArgs, args)
    // if the venue cannot be valued right now (paused market, stale feed), count only the cash the pool object holds
    total += out?.[0] ? sui.fromU64(out[0], HEALTH_QUOTE_NAV) : big(q.hot)
  }
  api.add(quote, total.toString())
}

/** Spot pool (pool::Pool<M, Q>): the quote balance in the pool object plus what it keeps apart. */
async function spotPool(api, cache, pkg, id, obj) {
  const typeArgs = sui.parseStructTag(obj.type).typeParams
  const total = big(obj.json.quote) + setApart(obj.json) + await creatorFees(cache, pkg, 'pool', typeArgs, id)
  api.add(typeArgs[1], total.toString())
}

async function core1(api, cache, dep, pkg, ids) {
  const objs = await loadObjects(ids, cache)
  await sdk.util.runInPromisePool({
    items: ids.map((id, i) => [id, objs[i]]),
    concurrency: 5,
    processor: async ([id, obj]) => {
      if (!obj?.type) return
      if (obj.type.includes('::composite_pool::CompositePool<')) return compositePool(api, cache, pkg, id, obj)
      if (obj.type.includes('::pool::Pool<')) return spotPool(api, cache, pkg, id, obj)
    },
  })
}

/** Leveraged token (token::LevToken<T, Q>): nav from token::status (free cash plus position equity at the oracle price). */
async function lev(api, cache, dep, pkg, ids) {
  const objs = await loadObjects(ids, cache)
  await sdk.util.runInPromisePool({
    items: ids.map((id, i) => [id, objs[i]]),
    concurrency: 5,
    processor: async ([id, obj]) => {
      if (!obj?.type) return
      const t = obj.json
      if (Number(t.state) === 0) return // being set up
      const typeArgs = sui.parseStructTag(obj.type).typeParams
      const [vault] = await loadObjects([t.vault], cache)
      const out = await view(cache, pkg, 'token', 'status', typeArgs, [
        { id: dep.config }, { id }, { id: t.vault }, { id: vault.json.account_id }, { id: t.market, mut: true },
        { id: t.registry }, { id: t.base_oracle }, { id: t.collateral_oracle }, { id: CLOCK },
      ])
      if (!out?.[0]) return // venue cannot be valued right now (logged in view)
      api.add(typeArgs[1], sui.fromU64(out[0], STATUS_NAV).toString())
    },
  })
}

const READERS = { core1, lev }

// ---------------------------------------------------------------- tvl

function normalize(id) {
  return '0x' + id.replace(/^0x/, '').toLowerCase().padStart(64, '0')
}

async function tvl(api) {
  const cache = new Map()
  for (const dep of DEPLOYMENTS) {
    const pkg = await latestPackage(dep.original)
    const ids = new Set()
    for (const type of OBJECT_TYPES[dep.layout]) {
      const objects = await sui.getObjectsByType(`${dep.original}::${type}`)
      objects.forEach(o => ids.add(normalize(o.id)))
    }
    sdk.log(`[perpsplexity] ${dep.version}: ${ids.size} pools/tokens`)
    await READERS[dep.layout](api, cache, dep, pkg, [...ids])
  }
}

module.exports = {
  timetravel: false,
  start: '2026-09-16', // first pool, ZUK on the immutable package
  doublecounted: true,
  methodology: 'TVL is what every Perpsplexity pool and leveraged token holds, valued by its own contract through a read-only call on the latest chain state. Leveraged pools: composite_pool::observe (observe_cash while a pool rests in cash) returns quote_nav = cash in the pool + its Suilend deposit + idle margin in its Aftermath reserve account + the value of its Aftermath perp position (collateral plus unrealized PnL and funding); the treasury, unpaid holder dividends, uncollected platform and creator fees and launch escrow kept in the pool are added. Spot pools: the quote balance in the pool plus the same set-apart balances. Leveraged tokens: token::status nav (free cash plus perp position equity at the oracle price). Pool tokens themselves (the meme coins in each pool reserve) are not counted. Marked doublecounted because part of the pools\' cash is lent on Suilend and also appears in Suilend\'s TVL. Margin posted on Aftermath Perps is not counted by any other DefiLlama adapter (Aftermath Perps has no TVL adapter), so it is included here.',
  sui: { tvl },
}
