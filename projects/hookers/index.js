const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// Hookers is a Uniswap V4 token launchpad on Robinhood Chain.
//
// One transaction creates the token, opens its pool and seeds the entire supply
// as a single one-sided position, then executes the creator's opening buy. The
// position is held by LiquidityCustody directly against the PoolManager: there
// is no per-pool contract and no LP NFT, so pool balances cannot be read and the
// reserves are derived from the position's liquidity, tick range and the pool's
// current price.
//
// The lock is structural rather than a timer. LiquidityCustody contains no code
// path that decreases liquidity or moves the position, so the ETH buyers pay in
// accumulates there permanently; only fees can leave.
//
// https://robinhoodchain.blockscout.com/address/0xd07c5d29e4f956562a65741bfd9b12900a5caf63?tab=contract
const FACTORY = '0xd07c5d29e4f956562a65741bfd9b12900a5caf63'

// Uniswap V4 StateView on Robinhood Chain, the deployment this repo already uses
// for V4 on this chain.
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'

// Block of the first TokenLaunched (2026-08-14); nothing to scan before it.
const FROM_BLOCK = 36138302

// Every launch seeds its position with a zero salt, so the position key is just
// (owner, tickLower, tickUpper); getPositionInfo hashes it on-chain.
const ZERO_SALT = '0x' + '0'.repeat(64)

const ABI = {
  tokenLaunched:
    'event TokenLaunched(address indexed creator, address indexed token, bytes32 indexed poolId, uint32 mechanismId, address hook, address custody, address quoteCurrency, uint16 buyFeeBps, uint16 sellFeeBps)',
  positions:
    'function positions(bytes32) view returns (int24 tickLower, int24 tickUpper, uint128 liquidity, bool seeded)',
  getSlot0:
    'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo:
    'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
}

async function tvl(api) {
  // 1. Enumerate launches. TokenLaunched fires for every launch style the
  //    mechanism registry offers, including the hookless one, and carries the
  //    custody that holds the position, so a style registered later needs no
  //    change here.
  const launches = await getLogs2({
    api,
    target: FACTORY,
    eventAbi: ABI.tokenLaunched,
    fromBlock: FROM_BLOCK,
  })
  if (!launches.length) return

  // 2. Tick range per launch, from the custody that owns the position.
  const positions = await api.multiCall({
    abi: ABI.positions,
    calls: launches.map((l) => ({ target: l.custody, params: [l.poolId] })),
  })

  const live = []
  launches.forEach((l, i) => {
    const p = positions[i]
    if (!p || !p.seeded) return
    live.push({
      token: l.token,
      quote: l.quoteCurrency,
      poolId: l.poolId,
      custody: l.custody,
      tickLower: Number(p.tickLower),
      tickUpper: Number(p.tickUpper),
    })
  })
  if (!live.length) return

  // 3. Current price/tick per pool, and the liquidity the PoolManager actually
  //    records for the position. Liquidity is read from Uniswap rather than from
  //    custody's own bookkeeping, so the number reflects what is really held.
  const [slot0, positionInfo] = await Promise.all([
    api.multiCall({
      abi: ABI.getSlot0,
      target: STATE_VIEW,
      calls: live.map((l) => ({ params: [l.poolId] })),
    }),
    api.multiCall({
      abi: ABI.getPositionInfo,
      target: STATE_VIEW,
      calls: live.map((l) => ({ params: [l.poolId, l.custody, l.tickLower, l.tickUpper, ZERO_SALT] })),
    }),
  ])

  // 4. Derive reserves. V4 orders currencies by address, so a natively quoted
  //    launch puts ETH (the zero address) first.
  live.forEach((l, i) => {
    const s = slot0[i]
    if (!s || !s.sqrtPriceX96 || s.sqrtPriceX96 === '0') return

    const liquidity = Number(positionInfo[i]?.liquidity || 0)
    if (!liquidity) return

    const quoteIsCurrency0 = l.quote.toLowerCase() < l.token.toLowerCase()
    const [token0, token1] = quoteIsCurrency0 ? [l.quote, l.token] : [l.token, l.quote]

    addUniV3LikePosition({
      api,
      token0,
      token1,
      liquidity,
      tickLower: l.tickLower,
      tickUpper: l.tickUpper,
      tick: Number(s.tick),
    })
  })
}

module.exports = {
  methodology:
    "TVL is the liquidity Hookers locks in the Uniswap V4 PoolManager across every token it has deployed. Each launch seeds one position owned by LiquidityCustody, which contains no path that decreases liquidity or moves it, so the ETH buyers pay in accumulates there permanently and only fees can leave. Launches are discovered from the factory's TokenLaunched logs, the tick range comes from the owning custody, the position's liquidity is read from Uniswap V4 StateView, and the reserves are derived from that liquidity, the tick range and the pool's current price. Every launch style is included. Both sides of each position are counted, so a launched token contributes only when it has a price of its own.",
  start: '2026-08-14',
  // These are Uniswap V4 pools, so the same funds are also counted by the
  // uniswap-v4 adapter, which reads raw PoolManager balances on this chain.
  doublecounted: true,
  robinhood: { tvl },
}
