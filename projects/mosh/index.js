const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { ethers } = require('ethers')

// BUN is Mosh's own token. Wherever it is counted (the pair asset of BUN-paired bundles, or the
// launched-token side of the first bundle's ranges) it is reported under staking instead of tvl.
const BUN = '0x07ebb29a38fbcb41563817e5e19f2cec619c90d2'

// PonsSwarm factories, one per counter asset; each emits SwarmCreated for every bundle
const FACTORIES = [
  '0x9073cb17846398fb8b379ab06c2b840dea7f0069', // native ETH
  '0xe5ec3e5f288036526112415385e4ce3331012887',
  '0xd32f988aa0d7e202c31f0bb0b3f8372adacc329b',
  '0x3c4cb58ef0f5b2f4d4b2cc786d51769ff4af5fe4',
  '0xea2594c7fbf4c443c023ef07899779b936395402',
  '0xa7634db2c4e54984be05a22287c42858358190e4',
  '0x290f546f96449449118f9fbb42465fddc2020f3f',
  '0xc9793e938198fede4d4877f4a09f24f0f377dde6',
  '0xf6d2268d5ebd75d15553ad275f2ec9147b6f4350', // BUN
]
const fromBlock = 70_000_000
// the first bundle ($BUN), created by the original deployment before the factories above
const LEGACY_SWARMS = ['0x7bdb0b02f41ca6644750b9e6ae75de08f1bc6d01']

// Uniswap's StateView lens on Robinhood Chain (the one DefiLlama's v4 helper uses)
const STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'
const RANGE_ABI = 'function ranges(uint256) view returns (uint8 venue, int24 tickLower, int24 tickUpper, uint128 liquidity, bytes32 salt)'
const EXTRA_VENUE_ABI = 'function extraVenues(uint256) view returns (uint24 fee, int24 tickSpacing)'
const GET_SLOT0_ABI = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
// Uniswap's V4Quoter on Robinhood Chain (developers.uniswap.org/docs/protocols/v4/deployments)
const QUOTER = '0x8dc178efb8111bb0973dd9d722ebeff267c98f94'
const QUOTE_ABI = 'function quoteExactInputSingle(((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, bool zeroForOne, uint128 exactAmount, bytes hookData) params) view returns (uint256 amountOut, uint256 gasEstimate)'

// keccak256(abi.encode(PoolKey)): Uniswap v4's pool id
function poolIdOf({ currency0, currency1, fee, tickSpacing, hooks }) {
  return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'address', 'uint24', 'int24', 'address'], [currency0, currency1, fee, tickSpacing, hooks]))
}

const SwarmCreated = 'event SwarmCreated(address indexed swarm, address indexed creator, uint256 index, bytes32 launchParamsHash)'

// Sums the swarms' and vaults' pair asset and both sides of the vaults' ranges, keeping only BUN
// (ownToken) or everything but BUN (!ownToken)
async function swarmBalances(api, ownToken) {
  const counts = (token) => (token.toLowerCase() === BUN) === ownToken
  const created = []
  for (const target of FACTORIES) created.push(...await getLogs2({ api, target, eventAbi: SwarmCreated, fromBlock }))
  const allSwarms = [...new Set([...created.map(i => i.swarm.toLowerCase()), ...LEGACY_SWARMS])]

  // a swarm's counter asset is fixed at creation; the legacy bundle predates counterIsNative() and is native ETH
  const native = await api.multiCall({ abi: 'bool:counterIsNative', calls: allSwarms, permitFailure: true })
  const counters = await api.multiCall({ abi: 'address:counterAsset', calls: allSwarms, permitFailure: true })
  const allCounters = allSwarms.map((s, i) => (native[i] ?? LEGACY_SWARMS.includes(s)) ? nullAddress : counters[i])
  // a swarm whose counter asset did not read is skipped rather than allowed to fail the whole run
  const swarms = allSwarms.filter((_, i) => Boolean(allCounters[i]))
  const counterOf = allCounters.filter(Boolean)
  if (!swarms.length) return api.getBalances()

  const memecoins = await api.multiCall({ abi: 'address:memecoin', calls: swarms, permitFailure: true })
  // counts say how many vaults exist: a failed read must fail the run, not read as zero vaults
  const vaultCounts = await api.multiCall({ abi: 'uint256:vaultCount', calls: swarms })
  // the launched token is only needed to build a range's pool key
  const hasPair = (i) => Boolean(memecoins[i]) && memecoins[i] !== nullAddress

  const vaultCalls = swarms.flatMap((s, i) => Array.from({ length: Number(vaultCounts[i]) }, (_, j) => ({ target: s, params: [j], swarm: i })))
  const vaults = await api.multiCall({ abi: 'function vaults(uint256) view returns (address)', calls: vaultCalls.map(({ target, params }) => ({ target, params })) })
  const swarmOfVault = vaults.map((_, k) => vaultCalls[k].swarm)

  // cash: the pair asset held by each swarm and each of its vaults
  const ownerTokens = swarms.map((s, i) => [[counterOf[i]], s])
  vaults.forEach((v, k) => ownerTokens.push([[counterOf[swarmOfVault[k]]], v]))
  const counted = ownerTokens.filter(([[token]]) => counts(token))
  if (counted.length) await sumTokens2({ api, ownerTokens: counted })

  // Each vault's pool key for venue 0, the token's Pons pool
  const fees = await api.multiCall({ abi: 'uint24:v4Fee', calls: vaults, permitFailure: true })
  const spacings = await api.multiCall({ abi: 'int24:v4TickSpacing', calls: vaults, permitFailure: true })
  const hooks = await api.multiCall({ abi: 'address:v4Hooks', calls: vaults, permitFailure: true })
  const pairOf = (i) => {
    const counter = counterOf[i], meme = memecoins[i]
    return BigInt(counter) < BigInt(meme) ? [counter, meme] : [meme, counter]
  }
  const ponsKeyOf = (k) => {
    if (!hooks[k] || hooks[k] === nullAddress) return null // not yet graduated: no Pons pool configured
    if (!hasPair(swarmOfVault[k]) || fees[k] == null || spacings[k] == null) return null // a key read failed: skip, not throw
    const [currency0, currency1] = pairOf(swarmOfVault[k])
    return { currency0, currency1, fee: fees[k], tickSpacing: spacings[k], hooks: hooks[k] }
  }

  // ranges: the vaults' open v4 positions. A vault holds them in the PoolManager directly (keyed by
  // owner, ticks and a salt), not as position NFTs, so each is valued here from its liquidity and
  // ticks at its pool's current price. Venue 0 is the Pons pool; venue i > 0 is extraVenues(i - 1),
  // a hookless pool on the same pair. Both sides are counted, as for any liquidity manager's
  // positions.
  // same for open ranges: a failed count must not drop the vault's liquidity silently
  const rangeCounts = await api.multiCall({ abi: 'uint256:openRangeCount', calls: vaults })
  const rangeCalls = vaults.flatMap((v, k) => Array.from({ length: Number(rangeCounts[k]) }, (_, j) => ({ target: v, params: [j], vault: k })))
  // a range or venue that does not read is skipped, not allowed to fail the whole run
  const ranges = rangeCalls.length ? await api.multiCall({ abi: RANGE_ABI, calls: rangeCalls.map(({ target, params }) => ({ target, params })), permitFailure: true }) : []
  const extraKeys = [...new Set(rangeCalls.map((r, j) => ranges[j] && Number(ranges[j].venue) > 0 ? `${r.vault}:${Number(ranges[j].venue)}` : null).filter(Boolean))]
  const extraCalls = extraKeys.map(key => { const [k, v] = key.split(':').map(Number); return { target: vaults[k], params: [v - 1], key } })
  const extras = extraCalls.length ? await api.multiCall({ abi: EXTRA_VENUE_ABI, calls: extraCalls.map(({ target, params }) => ({ target, params })), permitFailure: true }) : []
  const venueOf = new Map(extraCalls.map((c, i) => [c.key, extras[i]]))
  const rangeKeys = rangeCalls.map((r, j) => {
    if (!ranges[j]) return null
    const venue = Number(ranges[j].venue)
    if (venue === 0) return ponsKeyOf(r.vault)
    if (!hasPair(swarmOfVault[r.vault])) return null
    const [currency0, currency1] = pairOf(swarmOfVault[r.vault]), extra = venueOf.get(`${r.vault}:${venue}`)
    if (!extra) return null
    return { currency0, currency1, fee: extra.fee, tickSpacing: extra.tickSpacing, hooks: nullAddress }
  })

  // one slot0 read per pool a range sits on
  const rangePools = rangeKeys.map(key => key ? poolIdOf(key) : null)
  const pools = [...new Set(rangePools.filter(Boolean))]
  const slot0 = pools.length ? await api.multiCall({ abi: GET_SLOT0_ABI, target: STATE_VIEW, calls: pools, permitFailure: true }) : []
  const sqrtPriceOf = new Map(pools.map((id, i) => [id, slot0[i] ? Number(slot0[i].sqrtPriceX96) / 2 ** 96 : 0]))

  ranges.forEach((r, j) => {
    if (!r) return
    const key = rangeKeys[j], sp = key && sqrtPriceOf.get(rangePools[j]), L = Number(r.liquidity)
    if (!sp || !L) return
    const sa = Math.sqrt(1.0001 ** Number(r.tickLower)), sb = Math.sqrt(1.0001 ** Number(r.tickUpper))
    let amount0 = 0, amount1 = 0
    if (sp <= sa) amount0 = L * (sb - sa) / (sa * sb)
    else if (sp >= sb) amount1 = L * (sb - sa)
    else { amount0 = L * (sb - sp) / (sp * sb); amount1 = L * (sp - sa) }
    const i = swarmOfVault[rangeCalls[j].vault], counterIs0 = key.currency0 === counterOf[i]
    if (counts(counterOf[i])) api.add(counterOf[i], BigInt(Math.floor(counterIs0 ? amount0 : amount1)))
    if (counts(memecoins[i])) api.add(memecoins[i], BigInt(Math.floor(counterIs0 ? amount1 : amount0)))
  })

  // idle inventory: the launched token the vaults hold outside their ranges. Each swarm's idle balance
  // is counted only at what selling all of it in one swap into its Pons pool would return (V4Quoter)
  const idleSwarms = swarms.map((_, i) => i).filter(i => hasPair(i) && counts(memecoins[i]))
  const idleVaults = vaults.map((v, k) => ({ v, k })).filter(({ k }) => idleSwarms.includes(swarmOfVault[k]))
  if (idleVaults.length) {
    const idleBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: idleVaults.map(({ v, k }) => ({ target: memecoins[swarmOfVault[k]], params: [v] })) })
    const idleOf = new Map()
    const keyOf = new Map()
    idleVaults.forEach(({ k }, j) => {
      const i = swarmOfVault[k]
      idleOf.set(i, (idleOf.get(i) ?? 0n) + BigInt(idleBalances[j]))
      if (!keyOf.has(i) && ponsKeyOf(k)) keyOf.set(i, ponsKeyOf(k))
    })
    // a swarm whose token has not graduated has no Pons pool to sell into
    const sells = [...idleOf].filter(([i, idle]) => idle > 0n && keyOf.has(i)).map(([i, idle]) => ({ i, idle, key: keyOf.get(i) }))
    for (const { i, idle, key } of sells) {
      const memeIs0 = key.currency0 !== counterOf[i]
      const poolKey = [key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks]
      const { amountOut } = await api.call({ abi: QUOTE_ABI, target: QUOTER, params: [[poolKey, memeIs0, idle.toString(), '0x']] })
      const { sqrtPriceX96 } = await api.call({ abi: GET_SLOT0_ABI, target: STATE_VIEW, params: poolIdOf(key) })
      const s2 = BigInt(sqrtPriceX96) ** 2n, q192 = 1n << 192n
      const spotEquivalent = memeIs0 ? BigInt(amountOut) * q192 / s2 : BigInt(amountOut) * s2 / q192
      api.add(memecoins[i], spotEquivalent < idle ? spotEquivalent : idle)
    }
  }

  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the pair asset (native ETH or the bundle's ERC20 pair asset) held by Mosh bundles on Robinhood Chain, by each bundle's swarm contract (open raises and backers' unclaimed fees) and by its agent vaults, plus both sides of the vaults' open Uniswap v4 ranges. Launched tokens the vaults hold idle, outside their ranges, are counted only when DefiLlama prices them and at no more than what selling all of them in one swap into their Pons pool would return, read from the Uniswap v4 quoter. BUN is reported under staking wherever it appears. Range liquidity is also Uniswap v4 TVL, so the listing is double counted.",
  robinhood: {
    tvl: (api) => swarmBalances(api, false),
    staking: (api) => swarmBalances(api, true),
  },
}
