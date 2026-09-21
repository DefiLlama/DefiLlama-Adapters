const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// heks is a coin launchpad on Robinhood Chain. A coin goes straight into a Uniswap V4 pool as a
// single-sided position: the whole supply is placed in a range above the starting price, and the
// pool fills up with the pair asset as people buy.
//
// The position is held by a vault contract directly in the shared PoolManager. There is no
// per-pool contract and no LP NFT, so there is no balance to read: reserves are derived from the
// position's liquidity, its tick range and the pool's current price. The armsys adapter documents
// the same constraint — the PoolManager singleton holds every pool's reserves at once, so a single
// protocol's share cannot be read off its balance.
//
// https://robinhoodchain.blockscout.com/address/0x62cA64f87E051a2E190d17caA98E4a08f4a597dc
const LAUNCHPADS = [
  // Current deployment. New coins are created here.
  { launchpad: '0x62cA64f87E051a2E190d17caA98E4a08f4a597dc', vault: '0x89c0983D9B01F6CAe4FEcbb6b5D6296b44536400', fromBlock: 62705679 },
  // Previous deployment: creation was closed on 2026-09-15, but its positions are locked and still
  // trade, so the liquidity locked in them is still heks liquidity.
  { launchpad: '0x0647b0f4bFDEC1f64ffaD55Edcf24504269058de', vault: '0x3025685BE0c6Fa2Ce7ec3Ed6CdBdAF2E6309638f', fromBlock: 56970549 },
]

// Uniswap V4 StateView on Robinhood Chain — the same deployment other V4 adapters on this chain
// already use.
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'

// Positions are opened with a zero salt, so a position key is just (owner, tickLower, tickUpper).
const ZERO_SALT = '0x' + '0'.repeat(64)

const ABI = {
  tokenCreated:
    'event TokenCreated(address indexed token, address indexed creator, address indexed numeraire, bytes32 poolId, int24 derivedTick, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, int256 feedAnswer, uint256 feedUpdatedAt, uint256 launchFee, uint256 devBuyIn, uint256 devBuyOut, uint256 xKey, uint256 uiMultiplier, string metaURI)',
  getSlot0:
    'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo:
    'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
}

/**
 * Sums the liquidity heks holds in Uniswap V4 across every coin it has launched.
 *
 * Launches are listed from the launchpads' TokenCreated logs, each position's liquidity is read
 * from Uniswap V4 StateView, and the reserves are derived from that liquidity, the position's tick
 * range and the pool's current price.
 *
 * @param {object} api - DefiLlama chain API for the block being priced.
 */
async function tvl(api) {
  // 1. List the launches. One event carries everything needed downstream: both pool currencies,
  //    the pool id and the position's tick range — no extra configuration reads.
  const launches = []
  for (const set of LAUNCHPADS) {
    const logs = await getLogs2({
      api,
      target: set.launchpad,
      eventAbi: ABI.tokenCreated,
      fromBlock: set.fromBlock,
      extraKey: set.launchpad,
    })
    for (const l of logs) {
      launches.push({
        token: l.token,
        numeraire: l.numeraire,
        poolId: l.poolId,
        vault: set.vault,
        tickLower: Number(l.tickLower),
        tickUpper: Number(l.tickUpper),
      })
    }
  }
  if (!launches.length) return

  // 2. The pool's current price and the liquidity the PoolManager actually records against the
  //    position. Liquidity comes from Uniswap rather than our own bookkeeping, so the number
  //    reflects what is really there.
  const [slot0, positionInfo] = await Promise.all([
    api.multiCall({
      abi: ABI.getSlot0,
      target: STATE_VIEW,
      calls: launches.map((l) => ({ params: [l.poolId] })),
    }),
    api.multiCall({
      abi: ABI.getPositionInfo,
      target: STATE_VIEW,
      calls: launches.map((l) => ({ params: [l.poolId, l.vault, l.tickLower, l.tickUpper, ZERO_SALT] })),
    }),
  ])

  // 3. Derive the reserves. V4 orders currencies by address, so a pair with the native coin (the
  //    zero address) always has it as currency0.
  launches.forEach((l, i) => {
    const s = slot0[i]
    if (!s || !s.sqrtPriceX96 || s.sqrtPriceX96 === '0') return

    const liquidity = Number(positionInfo[i]?.liquidity || 0)
    if (!liquidity) return

    const numeraireIsCurrency0 = l.numeraire.toLowerCase() < l.token.toLowerCase()
    const [token0, token1] = numeraireIsCurrency0 ? [l.numeraire, l.token] : [l.token, l.numeraire]

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
    'TVL is the liquidity heks locks in the Uniswap V4 PoolManager across every coin it has launched. Each launch seeds one one-sided position owned by the launchpad vault, so the pair asset buyers pay in accumulates there and only fees can leave. Launches are read from the launchpad\'s TokenCreated logs, which carry both currencies and the position\'s tick range; the position\'s liquidity is read from Uniswap V4 StateView, and the reserves are derived from that liquidity, the tick range and the pool\'s current price. Both sides of each position are counted, so a launched coin contributes only once it has a price of its own.',
  start: '2026-09-10',
  // These are Uniswap V4 pools, and the same funds are already counted by the uniswap-v4 adapter,
  // which reads raw PoolManager balances on this chain.
  doublecounted: true,
  robinhood: { tvl },
}
