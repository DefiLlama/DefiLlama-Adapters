const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { sliceIntoChunks, sleep } = require('../helper/utils')

const FACTORY = '0x1ca37B3C40e89aaD48b5ad3352269c2293CFD3DA' // LaunchpadFactoryV4
const FROM_BLOCK = 21077993
const HOOK = '0xca55CDde6578F6f8113dd339520E13418Abc2acC' // LaunchHook
const STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b' // Uniswap V4 StateView on Arc
const ZERO_SALT = '0x' + '0'.repeat(64)

const ABI = {
  tokenLaunched: 'event TokenLaunchedV4(address indexed token, address indexed creator, bytes32 indexed poolId, address quote, uint256 positionId, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 initialBuyE6, string name, string symbol, string metadataURI)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo: 'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
}

async function tvl(api) {
  const launches = await getLogs2({ api, target: FACTORY, eventAbi: ABI.tokenLaunched, fromBlock: FROM_BLOCK, extraKey: 'lift-v2-launches' })

  // the hook allows one add per pool (the launch mint) and no removal, so the launch position keeps the logged
  // liquidity; LaunchHook.compound adds depth as a hook-owned position over the same range
  for (const chunk of sliceIntoChunks(launches, 500)) {
    const slot0 = await api.multiCall({ abi: ABI.getSlot0, target: STATE_VIEW, calls: chunk.map((l) => l.poolId) })
    const compounded = await api.multiCall({ abi: ABI.getPositionInfo, target: STATE_VIEW, calls: chunk.map((l) => ({ params: [l.poolId, HOOK, l.tickLower, l.tickUpper, ZERO_SALT] })) })
    chunk.forEach((l, i) => {
      const liquidity = Number(BigInt(l.liquidity) + BigInt(compounded[i].liquidity))
      // the quote is always currency0 of a LIFT pool; only the quote side is counted
      addUniV3LikePosition({ api, token0: l.quote, token1: l.token, liquidity, tickLower: Number(l.tickLower), tickUpper: Number(l.tickUpper), tick: Number(slot0[i].tick) })
      api.removeTokenBalance(l.token)
    })
    await sleep(1000) // the public Arc RPC rate-limits bursts of multicalls
  }
}

module.exports = {
  methodology: 'TVL is the quote side (USDC or EURC) of the Uniswap V4 liquidity LIFT locks in its hooked pools. Every LaunchpadFactoryV4 launch mints its whole token supply into one single-sided position; the LaunchHook allows no other deposit and refuses every liquidity removal, and creator fees routed to liquidity are added by the hook as a second position over the same range. Positions are valued from their liquidity, tick range and the pool price read from StateView. Launched tokens and fees waiting in the hook are not counted.',
  start: '2026-09-16',
  doublecounted: true, // the same pools are counted by the Uniswap V4 adapter on arc
  arc: { tvl },
}
