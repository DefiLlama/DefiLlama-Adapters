const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Mercurifi Trade (trade.mercuri.finance), a hook-based AMM on Arc: tokens that graduate from the Mercurifi
// Launchpad trade in Uniswap V4 pools opened at graduation, where the protocol's immutable LaunchHook charges
// the fee. The graduation transaction sends the full-range position to the LiquidityLocker, which has no
// withdrawal path. Curves that have not graduated are the launchpad listing (projects/mercurifi-launchpad).
// Contracts: https://github.com/mercuri-finance/mercuri-launch-contracts
const FACTORY = '0x8f5DfA0c48E14cCD03AE01795B8a95759BA859EB'
const LIQUIDITY_LOCKER = '0x278e5162074BC4fc98e91E90857FDbc374d1f391'
const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const FACTORY_BLOCK = 22060881 // LaunchFactory deployment

/**
 * Sums the USDC side of the Uniswap V4 positions permanently locked in the LiquidityLocker.
 *
 * @param {Object} api - the adapter's chain API for this block and chain
 * @returns {Promise<Object|undefined>} the balances object, or undefined while no token has graduated
 */
async function tvl(api) {
  const launches = await getLogs2({
    api, target: FACTORY, fromBlock: FACTORY_BLOCK,
    eventAbi: 'event TokenCreated(address indexed token, address indexed curve, address indexed creator, address deployer, string name, string symbol, string metadataURI, bytes32 configHash, (uint256,uint256,uint256,uint256,uint256,uint256,uint16,uint16,uint16,uint16,uint32) config)',
  })
  if (!launches.length) return

  // The locker records the position it holds for each token, so the ids are read from it rather than
  // enumerated from PositionManager Transfer events.
  const positions = await api.multiCall({
    target: LIQUIDITY_LOCKER, abi: 'function positionOf(address) view returns (uint256)',
    calls: launches.map(i => i.token),
  })
  const positionIds = positions.filter(i => +i > 0).map(i => i.toString())
  if (!positionIds.length) return

  return sumTokens2({
    api, resolveUniV4: true,
    uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens: [ADDRESSES.arc.USDC] },
  })
}

module.exports = {
  doublecounted: true, // the locked positions already sit inside Uniswap V4's TVL on Arc
  methodology: 'TVL is the USDC side of the Uniswap V4 positions permanently locked in the LiquidityLocker, whose token ids are read from the locker itself. Launched tokens and unclaimed fees are excluded. Marked doublecounted because the locked positions are already counted in Uniswap V4 TVL on Arc.',
  start: '2026-09-21',
  arc: { tvl },
}
