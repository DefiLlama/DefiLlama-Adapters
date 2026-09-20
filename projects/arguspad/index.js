const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getCache, setCache } = require('../helper/cache')

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
  ADDRESSES.arc.USDC,   // 0x3600..0000, the 6 decimal ERC20 view. Native USDC is not used here.
  ADDRESSES.arc.EURC,
  ADDRESSES.arc.WETH,
  ADDRESSES.arc.cirBTC,
  '0xeCe5cA8bf9220718E5727754026757512212cb3c', // ARGUS
  '0x0BFFa97f774824e9dA843699aEDd2835cb1b8022', // ARCASH
  '0x178b01f61CBeA1D2a5581Fe1621Be607835EC349', // XAUM
]
const QUOTE_SET = new Set(QUOTE_ASSETS.map(i => i.toLowerCase()))

// launches(token) widened across generations, so each Portal is decoded with the struct width it
// declares through LAUNCH_STRUCT_WORDS. The shapes are all-static and identically prefixed, so a
// narrower ABI would decode a wider record without reverting and quietly return the wrong field.
const LAUNCH_ABI = {
  9: 'function launches(address) view returns (address creator, int24 tickStart, bool tokenIsToken0, address locker, address hook, address splitter, uint16 buyTaxBps, uint16 sellTaxBps, uint256 positionId)',
  10: 'function launches(address) view returns (address creator, int24 tickStart, bool tokenIsToken0, address locker, address hook, address splitter, uint16 buyTaxBps, uint16 sellTaxBps, uint256 positionId, int24 tickBond)',
  11: 'function launches(address) view returns (address creator, int24 tickStart, bool tokenIsToken0, address locker, address hook, address splitter, uint16 buyTaxBps, uint16 sellTaxBps, uint256 positionId, int24 tickBond, address quoteAsset)',
  v3: 'function launches(address) view returns (address creator, int24 tickStart, int24 tickBond, bool tokenIsToken0, bool bonded, address pool, address processor, address tracker, address locker, uint256 positionId)',
}

// Every Portal ArgusPad has launched from, on both lines. Enumerated from the deployer's complete
// CREATE history rather than from logs, so this is the whole set and not the set that happens to
// fall inside log retention. Three further Portals exist and have never carried a launch.
const PORTALS = [
  { address: '0xB021Be536808f551b31789422Fd28a6c9c6e97Da', shape: 11 },
  { address: '0xA5628A11c412596E1f63b75a2C0284F843C549d6', shape: 11 },
  { address: '0x07a688a001f416cC433c68Ff56Aa26bC5131Cc6E', shape: 10 },
  { address: '0xa36c443A797771Df82533B8B4A86F0AFfd970862', shape: 10 },
  { address: '0x7A17Ab0106C46C0be30623F3EB7F299CC0058338', shape: 9 },
  { address: '0xBed9880A0ba12722ba4b8791c0B6F8c74338246C', shape: 'v3' },
  { address: '0x0F1C7Cb26D6cD36BD4189E41947658b39437587A', shape: 'v3' },
]

const PAGE_SIZE = 500
const CACHE_PROJECT = 'arguspad'

// Each Portal's registry is append-only: getTokens(offset, limit) indexes a push-only array and
// tokenCount() is its length, so a launch's slot never moves and its positionId is minted once and
// never reissued. That makes tokenCount() an exact cursor - everything below the cached count is
// already known and is not read again. Only the tail is enumerated on each run, which is what keeps
// a 140k-launch protocol affordable: the per-launch reads that remain are the position reads, which
// have to be redone every run because they are the TVL.
async function getLaunches(api) {
  const cache = await getCache(CACHE_PROJECT, api.chain, { skipCompression: true })
  const cached = cache.portals ?? {}

  const counts = await api.multiCall({ abi: 'uint256:tokenCount', calls: PORTALS.map(i => i.address) })

  const pageShapes = []
  const pageCalls = []
  PORTALS.forEach(({ address, shape }, i) => {
    const key = address.toLowerCase()
    if (!cached[key] || !Array.isArray(cached[key].launches)) cached[key] = { count: 0, launches: [] }
    // A run at a past block sees a shorter registry than the cache holds. Because the registry is
    // append-only, the launches this block knew about are exactly the first tokenCount() of them,
    // so the cached list is read short rather than re-enumerated - and, below, it is not written
    // back, so a historical run cannot truncate the cache for the live one.
    const from = Math.min(cached[key].launches.length, +counts[i])
    for (let offset = from; offset < +counts[i]; offset += PAGE_SIZE) {
      pageShapes.push(shape)
      pageCalls.push({ target: address, params: [offset, Math.min(PAGE_SIZE, +counts[i] - offset)] })
    }
  })

  if (pageCalls.length) {
    // getTokens reads one cold storage slot per token returned, so these are chunked well below the
    // node's 30M gas ceiling on eth_call; every other call here is cheap enough for the default chunk.
    const pages = await api.multiCall({
      abi: 'function getTokens(uint256 offset, uint256 limit) view returns (address[])',
      calls: pageCalls, chunkSize: 10,
    })

    const newCalls = {}
    pages.forEach((tokens, i) => {
      const shape = pageShapes[i]
      if (!newCalls[shape]) newCalls[shape] = []
      tokens.forEach(token => newCalls[shape].push({ target: pageCalls[i].target, params: token }))
    })

    for (const [shape, calls] of Object.entries(newCalls)) {
      const launches = await api.multiCall({ abi: LAUNCH_ABI[shape], calls })
      launches.forEach(({ positionId }, i) => {
        const key = calls[i].target.toLowerCase()
        cached[key].launches.push([calls[i].params.toLowerCase(), String(positionId)])
      })
    }
  }

  // Each Portal's registry states how many launches it has; anything else means a page was lost.
  const out = PORTALS.map(({ address, shape }, i) => {
    const entry = cached[address.toLowerCase()]
    if (entry.launches.length < +counts[i])
      throw new Error(`arguspad: ${address} enumerated ${entry.launches.length} launches, registry reports ${counts[i]}`)
    entry.count = entry.launches.length
    return { shape, launches: entry.launches.slice(0, +counts[i]) }
  })

  // Only ever grow the stored list. A past-block run reads a prefix of it and writes nothing.
  if (pageCalls.length) await setCache(CACHE_PROJECT, api.chain, { portals: cached }, { skipCompression: true })
  const total = out.reduce((acc, p) => acc + p.launches.length, 0)
  sdk.log(`[arguspad] ${total} launches at this block (${pageCalls.length} pages read this run)`)
  return out
}

async function tvl(api) {
  // Launches come from each Portal's own registry, not from TokenCreated logs: several unrelated
  // launchpads on Arc run forks of this codebase and emit a byte-identical event, so matching on
  // topic0 would attribute their launches to ArgusPad. The registry is also the only source that
  // does not depend on log retention - two of the four public Arc endpoints keep only about two
  // days of logs, and the first launch is well outside that.
  const portals = await getLaunches(api)

  // A launch token can itself be one of the quote assets - ARGUS and ARCASH were both launched on
  // ArgusPad. Those positions are grouped on their own so the launch token can be blacklisted for
  // them, leaving every position contributing only the side that is not its own launch token.
  const groups = {}
  for (const { shape, launches } of portals) {
    for (const [token, positionId] of launches) {
      const self = QUOTE_SET.has(token) ? token : ''
      if (!groups[self]) groups[self] = { v3: [], v4: [] }
      groups[self][shape === 'v3' ? 'v3' : 'v4'].push(positionId)
    }
  }

  for (const [self, { v3, v4 }] of Object.entries(groups)) {
    const config = { api, uniV3WhitelistedTokens: QUOTE_ASSETS, blacklistedTokens: self ? [self] : [] }
    if (v3.length) config.uniV3ExtraConfig = { nftAddress: POSITION_MANAGER_V3, positionIds: v3 }
    if (v4.length) config.uniV4ExtraConfig = { nftAddress: POSITION_MANAGER_V4, stateViewer: STATE_VIEW, positionIds: v4 }
    await sumTokens2(config)
  }

  return api.getBalances()
}

module.exports = {
  methodology: "TVL is the quote-asset side of the permanently locked launch liquidity. Launches are enumerated from the registry of every ArgusPad Portal on both the Uniswap v4 and the retired Uniswap v3 line, each Portal supplying the id of the LP NFT held by that launch's locker, and each position is then valued from its pool key, tick range and the pool's current price. Only the seven assets a launch can be quoted in are counted - USDC, EURC, WETH, cirBTC, ARGUS, ARCASH and XAUM. The launch token on the other side of every position is excluded, because its only market is the pool ArgusPad itself seeded with the entire supply and pricing it there would make TVL reflexive. Uncollected trading fees and the balances parked in the per-launch fee splitters are also excluded. Marked doublecounted because the locked v4 positions sit in the Uniswap v4 PoolManager on Arc and are already inside Uniswap v4's TVL there.",
  doublecounted: true,
  arc: { tvl },
}
