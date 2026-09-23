const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getCache, setCache } = require('../helper/cache')
const { getCreateAddress, Interface } = require('ethers')

// ArgusPad launches a tax token and seeds a single concentrated-liquidity position with the whole
// supply. The LP NFT is minted to a locker clone created for that launch, and the locker has no
// withdrawal path, so the position is permanently locked. The live generations use Uniswap v4; two
// retired generations used Uniswap v3.
const POSITION_MANAGER_V4 = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B'
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const POSITION_MANAGER_V3 = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377'

// The seven assets a launch can be quoted in. The other side of every position is the launch token,
// which is deliberately not counted - see the methodology note below.
const QUOTE_ASSETS = [
  ADDRESSES.arc.USDC,
  ADDRESSES.arc.EURC,
  ADDRESSES.arc.WETH,
  ADDRESSES.arc.cirBTC,
  '0xeCe5cA8bf9220718E5727754026757512212cb3c', // ARGUS
  '0x0BFFa97f774824e9dA843699aEDd2835cb1b8022', // ARCASH
  '0x178b01f61CBeA1D2a5581Fe1621Be607835EC349', // XAUM
]
const QUOTE_SET = new Set(QUOTE_ASSETS.map(i => i.toLowerCase()))

// Every Portal that has carried a launch. Later v4 Portals append fields to the launch struct, but
// positionId sits at the same offset in all of them, so one ABI reads every v4 generation.
const PORTALS = {
  v4: [
    '0xB021Be536808f551b31789422Fd28a6c9c6e97Da',
    '0xA5628A11c412596E1f63b75a2C0284F843C549d6',
    '0x07a688a001f416cC433c68Ff56Aa26bC5131Cc6E',
    '0xa36c443A797771Df82533B8B4A86F0AFfd970862',
    '0x7A17Ab0106C46C0be30623F3EB7F299CC0058338',
  ],
  v3: [
    '0xBed9880A0ba12722ba4b8791c0B6F8c74338246C',
    '0x0F1C7Cb26D6cD36BD4189E41947658b39437587A',
  ],
}

const LAUNCH_ABI = {
  v4: 'function launches(address) view returns (address creator, int24 tickStart, bool tokenIsToken0, address locker, address hook, address splitter, uint16 buyTaxBps, uint16 sellTaxBps, uint256 positionId)',
  v3: 'function launches(address) view returns (address creator, int24 tickStart, int24 tickBond, bool tokenIsToken0, bool bonded, address pool, address processor, address tracker, address locker, uint256 positionId)',
}

const PAGE_SIZE = 500

// Portal 8 (ArgusV5Portal), live since block 22251798 and where every new launch goes. Its launch is
// the same locked single-sided Uniswap v4 position, minted to a locker made for that launch, but the
// Portal keeps no token list - there is no tokenCount() or getTokens(), only launchCount() and a
// different 7-field launches(token) - so it is enumerated another way. Every Portal 8 launch deploys
// its token, escrow and locker through one parts factory, three of its nonces per launch (token,
// then escrow by CREATE2, then locker), so each launched token is a CREATE address of the factory:
// candidates are derived from its nonces and a candidate counts only if Portal 8's own
// launches(token) names a hook for it. The factory is permissionless, so anything else it deploys
// is simply not in the registry. launchCount() is the stopping rule, so the enumeration is complete
// by construction or it throws.
const PORTAL_8 = '0xeed7559B8A6ABf64427dc41Cb5cc6400109C5D93'
const PORTAL_8_PARTS_FACTORY = '0xD969062076F75fbC4fd0195561501dC13eF87C72'
const PORTAL_8_LAUNCH_ABI = 'function launches(address token) view returns (address hook, address escrow, address locker, uint256 positionId, int24 tickStart, int24 tickBond, bool tokenIsToken0)'
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

// A registry size that fails in the batch is read again with a direct eth_call, which the SDK's
// provider retries across every configured endpoint. A Portal that did not exist yet at the block
// has no code there, and a call to an address with no code succeeds with empty return data, so
// '0x' - and only '0x' - is an empty registry; a deployed Portal answers 32 bytes. A revert, or an
// RPC error on every endpoint, throws rather than becoming a silent zero.
async function registrySizes(api, portals, getter) {
  const abi = `function ${getter}() view returns (uint256)`
  const iface = new Interface([abi])
  const sizes = await api.multiCall({ abi, calls: portals, permitFailure: true })
  return Promise.all(portals.map(async (portal, i) => {
    if (sizes[i] != null) return +sizes[i]
    let raw
    try {
      raw = await api.provider.call({ to: portal, data: iface.encodeFunctionData(getter), blockTag: api.block ?? 'latest' })
    } catch (e) {
      throw new Error(`arguspad: ${getter}() on ${portal} at block ${api.block ?? 'latest'} failed on every RPC, not an empty registry: ${JSON.stringify(e?.errors ?? e?.message ?? e).slice(0, 300)}`)
    }
    if (raw === '0x') return 0
    return +iface.decodeFunctionResult(getter, raw)[0].toString()
  }))
}

// Cached as [token, positionId, factory nonce], in nonce order, which is launch order. A run at a
// past block uses the first launchCount() entries; the next scan starts after the last known launch.
async function getPortal8Launches(api, cache, count) {
  const key = PORTAL_8.toLowerCase()
  const known = cache[key] ?? []
  let updated = false
  let nonce = known.length ? known[known.length - 1][2] + 1 : 1 // a contract's first CREATE uses nonce 1
  let scanned = 0
  while (known.length < count) {
    // three factory nonces per launch; anything else the factory deployed only lengthens the scan
    const nonces = Array.from({ length: 3 * (count - known.length) + 2 }, (_, i) => nonce + i)
    const candidates = nonces.map(n => getCreateAddress({ from: PORTAL_8_PARTS_FACTORY, nonce: n }).toLowerCase())
    const records = await api.multiCall({ target: PORTAL_8, abi: PORTAL_8_LAUNCH_ABI, calls: candidates })
    records.forEach((record, i) => {
      if (record.hook.toLowerCase() === NULL_ADDRESS) return
      known.push([candidates[i], String(record.positionId), nonces[i]])
      updated = true
    })
    nonce = nonces[nonces.length - 1] + 1
    scanned += nonces.length
    if (known.length < count && scanned > 3 * count + 10000) throw new Error(`arguspad: found ${known.length} of Portal 8's ${count} launches in ${scanned} parts-factory nonces`)
  }
  cache[key] = known
  return { launches: known.slice(0, count).map(([token, positionId]) => [token, positionId]), updated }
}

// Each Portal's registry is append-only, so the cached [token, positionId] list is always a prefix
// of it: only launches past the cached length are read, and a run at a past block uses the first
// tokenCount() entries.
async function getLaunches(api) {
  const cache = await getCache('arguspad', api.chain)
  const portals = [...PORTALS.v4.map(p => [p, 'v4']), ...PORTALS.v3.map(p => [p, 'v3'])]
  // The Portals were deployed over three weeks (V3-1 carried a launch on 2026-09-02, Portal 8 was
  // deployed on 2026-09-22), so a run at a past block reads Portals that did not exist yet.
  const counts = await registrySizes(api, portals.map(([p]) => p), 'tokenCount')
  const [portal8Count] = await registrySizes(api, [PORTAL_8], 'launchCount')
  let updated = false
  const launches = { v3: [], v4: [] }

  for (const [i, [portal, version]] of portals.entries()) {
    const key = portal.toLowerCase()
    const known = cache[key] ?? []
    const count = counts[i]
    if (known.length < count) {
      const pages = []
      for (let offset = known.length; offset < count; offset += PAGE_SIZE) pages.push([offset, Math.min(PAGE_SIZE, count - offset)])
      // getTokens reads one cold slot per token, so pages are chunked well below the eth_call gas cap
      const tokens = (await api.multiCall({ target: portal, abi: 'function getTokens(uint256 offset, uint256 limit) view returns (address[])', calls: pages.map(params => ({ params })), chunkSize: 10 })).flat()
      const info = await api.multiCall({ target: portal, abi: LAUNCH_ABI[version], calls: tokens })
      tokens.forEach((token, j) => known.push([token.toLowerCase(), String(info[j].positionId)]))
      cache[key] = known
      updated = true
    }
    launches[version] = launches[version].concat(known.slice(0, count))
  }

  const portal8 = await getPortal8Launches(api, cache, portal8Count)
  launches.v4 = launches.v4.concat(portal8.launches)
  updated = updated || portal8.updated

  if (updated) await setCache('arguspad', api.chain, cache)
  return launches
}

async function tvl(api) {
  const launches = await getLaunches(api)

  // ARGUS and ARCASH were themselves launched on ArgusPad, so their own positions are summed with
  // the launch token blacklisted; every other position only has its quote side whitelisted.
  const groups = {}
  for (const version of ['v3', 'v4']) {
    for (const [token, positionId] of launches[version]) {
      const self = QUOTE_SET.has(token) ? token : ''
      groups[self] = groups[self] ?? { v3: [], v4: [] }
      groups[self][version].push(positionId)
    }
  }

  for (const [self, { v3, v4 }] of Object.entries(groups)) {
    const config = { api, uniV3WhitelistedTokens: QUOTE_ASSETS, blacklistedTokens: self ? [self] : [] }
    if (v3.length) config.uniV3ExtraConfig = { nftAddress: POSITION_MANAGER_V3, positionIds: v3 }
    if (v4.length) config.uniV4ExtraConfig = { nftAddress: POSITION_MANAGER_V4, stateViewer: STATE_VIEW, positionIds: v4 }
    await sumTokens2(config)
  }
}

module.exports = {
  methodology: "TVL is the quote-asset side of the permanently locked launch liquidity. Launches are enumerated from the registry of every ArgusPad Portal on both the Uniswap v4 and the retired Uniswap v3 line - Portal 8, which keeps no token list, through the parts factory that deploys its launches, each candidate confirmed by Portal 8's own registry and the count checked against its launchCount() - each Portal supplying the id of the LP NFT held by that launch's locker, and each position is then valued from its pool key, tick range and the pool's current price. Only the seven assets a launch can be quoted in are counted - USDC, EURC, WETH, cirBTC, ARGUS, ARCASH and XAUM. The launch token on the other side of every position is excluded, because its only market is the pool ArgusPad itself seeded with the entire supply and pricing it there would make TVL reflexive. Uncollected trading fees, the balances parked in the per-launch fee splitters and escrows, and the launched tokens Portal 8 buys and locks in its lock vault are also excluded. Marked doublecounted because the locked v4 positions sit in the Uniswap v4 PoolManager on Arc and are already inside Uniswap v4's TVL there.",
  doublecounted: true,
  arc: { tvl },
}
