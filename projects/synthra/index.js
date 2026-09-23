const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const POOL_CREATED_EVENT =
  'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
const LAUNCH_CREATED_EVENT =
  'event LaunchCreated(address indexed token, address indexed creator, string name, string symbol, string metadataURI, uint256 totalSupply, uint16 creatorShareOfRestBps)'
const GET_CURVE_ABI =
  'function getCurve(address token) view returns (uint128 virtualUsdc, uint128 virtualTokens, uint128 realTokenReserves, uint128 realUsdcReserves, uint128 lpTokenReserve, uint128 buybackPot, uint128 tokensBurned, uint128 buybackUsdcSpent, uint128 initialCurveSupply, address creator, uint64 createdAt, bool complete, bool graduated)'

// Every canonical Synthra deployment. V3 and V3.1 are separate factory generations with the same
// pool interface; both are live and both are counted. Launch curves are quoted in the chain's
// launch quote asset (WETH on Robinhood Chain, USDC on Arc).
const CONFIG = {
  robinhood: {
    factories: [
      { address: '0x6307fc239C7964942c1BfFE51930E55606619c74', fromBlock: 9539103 }, // V3
      { address: '0x8f419898da502d3f49ef379775507210de2bfe3a', fromBlock: 68225870 }, // V3.1
    ],
    quote: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
    launchpads: [
      { address: '0xFc645480c1F40c03DeaBD9fD54E6BC42d0b3863E', fromBlock: 26854539, key: 'launchpad-v1' },
      { address: '0x3D26D96BC9d1C3FcAE0D156E830c723051364847', fromBlock: 26936269, key: 'launchpad-v2' },
    ],
  },
  arc: {
    factories: [
      { address: '0x6307fc239C7964942c1BfFE51930E55606619c74', fromBlock: 12953009 }, // V3
      { address: '0x84169f9adf4f5f0e483bfc350498a85b1d7ec638', fromBlock: 21893415 }, // V3.1
    ],
    quote: '0x3600000000000000000000000000000000000000', // USDC
    launchpads: [
      { address: '0x18D33De5eefB2F91B09385f35f6a1317659cc1F9', fromBlock: 13716990, key: 'launchpad' },
    ],
  },
}

async function poolsTvl(api, factories) {
  const ownerTokens = []
  for (const { address, fromBlock } of factories) {
    if (api.block && api.block < fromBlock) continue
    // No extraKey: the dimension adapters read pools from this same per-factory log cache.
    const pools = await getLogs({ api, target: address, fromBlock, eventAbi: POOL_CREATED_EVENT, onlyArgs: true })
    pools.forEach(({ token0, token1, pool }) => ownerTokens.push([[token0, token1], pool]))
  }
  if (!ownerTokens.length) return
  await sumTokens2({ api, ownerTokens, permitFailure: ownerTokens.length > 2000 })
}

async function curvesTvl(api, { quote, launchpads }) {
  const calls = []
  for (const { address, fromBlock, key } of launchpads) {
    // Historical queries before a deployment must not attempt to scan a future block range.
    if (api.block && api.block < fromBlock) continue
    const launches = await getLogs({ api, target: address, fromBlock, eventAbi: LAUNCH_CREATED_EVENT, onlyArgs: true, extraKey: key })
    launches.forEach(({ token }) => calls.push({ target: address, params: [token] }))
  }
  if (!calls.length) return
  const curves = await api.multiCall({ abi: GET_CURVE_ABI, calls, permitFailure: true })
  // Only real quote reserves back curve trades and later seed V3 liquidity. Virtual reserves are
  // pricing-only; buyback/creator/protocol fee pots are excluded. Once a launch graduates,
  // realUsdcReserves becomes zero and the same capital is counted through its V3 pool instead.
  curves.forEach((curve) => { if (curve) api.add(quote, curve.realUsdcReserves) })
}

module.exports = {
  methodology:
    'Counts both sides of every pool created by the canonical Synthra V3 and V3.1 factories, plus the real quote-asset reserves (WETH on Robinhood Chain, USDC on Arc) backing active Synthra Launch bonding curves. Virtual curve reserves and fee pots are excluded. At graduation the curve reserve is removed and the resulting pool liquidity is counted through the factory, preventing double counting.',
}

Object.entries(CONFIG).forEach(([chain, config]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      await poolsTvl(api, config.factories)
      await curvesTvl(api, config)
    },
  }
})
