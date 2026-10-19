const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const LAUNCH_CREATED_EVENT =
  'event LaunchCreated(address indexed token, address indexed creator, string name, string symbol, string metadataURI, uint256 totalSupply, uint16 creatorShareOfRestBps)'
const GET_CURVE_ABI =
  'function getCurve(address token) view returns (uint128 virtualUsdc, uint128 virtualTokens, uint128 realTokenReserves, uint128 realUsdcReserves, uint128 lpTokenReserve, uint128 buybackPot, uint128 tokensBurned, uint128 buybackUsdcSpent, uint128 initialCurveSupply, address creator, uint64 createdAt, bool complete, bool graduated)'

// Launch curves are quoted in the chain's launch quote asset (WETH on Robinhood Chain, USDC on Arc).
const CONFIG = {
  robinhood: {
    quote: ADDRESSES.robinhood.WETH, // WETH
    launchpads: [
      { address: '0xFc645480c1F40c03DeaBD9fD54E6BC42d0b3863E', fromBlock: 26854539, key: 'launchpad-v1' },
      { address: '0x3D26D96BC9d1C3FcAE0D156E830c723051364847', fromBlock: 26936269, key: 'launchpad-v2' },
    ],
  },
  arc: {
    quote: ADDRESSES.arc.USDC, // USDC
    launchpads: [
      { address: '0x18D33De5eefB2F91B09385f35f6a1317659cc1F9', fromBlock: 13716990, key: 'launchpad' },
    ],
  },
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
  // realUsdcReserves becomes zero and the same capital is counted through its Synthra V3 pool instead.
  curves.forEach((curve) => { if (curve) api.add(quote, curve.realUsdcReserves) })
}

module.exports = {
  methodology:
    'Counts the real quote-asset reserves (WETH on Robinhood Chain, USDC on Arc) backing active Synthra Launch bonding curves. Virtual curve reserves and fee pots are excluded. At graduation the curve reserve is removed and the resulting pool liquidity is counted by Synthra V3, preventing double counting.',
}

Object.entries(CONFIG).forEach(([chain, config]) => {
  module.exports[chain] = { tvl: (api) => curvesTvl(api, config) }
})
