const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Mercurifi Launchpad (launch.mercuri.finance), a bonding-curve launchpad on Arc: a launch deploys a token and
// its own bonding curve, and the token trades against that curve priced in USDC, which is also Arc's gas
// token. The buy that sells the curve out opens a Uniswap V4 pool at the curve's last price in the same
// transaction; the locked pool positions are the Mercurifi Trade listing (projects/mercurifi), not counted
// here. Contracts: https://github.com/mercuri-finance/mercuri-launch-contracts
const FACTORY = '0x8f5DfA0c48E14cCD03AE01795B8a95759BA859EB'
const FACTORY_BLOCK = 22060881 // LaunchFactory deployment
// A curve holds its reserve as the chain's gas token (native USDC, 18 decimals).
const NATIVE_USDC = ADDRESSES.null
const PHASE_GRADUATED = 2 // BondingCurve.Phase: Trading, GraduationPending, Graduated

/**
 * Sums the native USDC still sitting in bonding curves that have not graduated.
 *
 * @param {Object} api - the adapter's chain API for this block and chain
 * @returns {Promise<Object|undefined>} the balances object, or undefined when nothing has launched yet
 */
async function tvl(api) {
  const launches = await getLogs2({
    api, target: FACTORY, fromBlock: FACTORY_BLOCK,
    eventAbi: 'event TokenCreated(address indexed token, address indexed curve, address indexed creator, address deployer, string name, string symbol, string metadataURI, bytes32 configHash, (uint256,uint256,uint256,uint256,uint256,uint256,uint16,uint16,uint16,uint16,uint32) config)',
  })
  if (!launches.length) return

  // A graduated curve keeps nothing: it hands its reserve to the pool and forwards the remainder, so it is
  // skipped rather than summed as zero.
  const phases = await api.multiCall({ abi: 'uint8:phase', calls: launches.map(i => i.curve) })
  const liveCurves = launches.filter((_, i) => +phases[i] !== PHASE_GRADUATED).map(i => i.curve)
  return sumTokens2({ api, owners: liveCurves, tokens: [NATIVE_USDC] })
}

module.exports = {
  methodology: 'TVL is the native USDC held by bonding curves that have not graduated. Launched tokens and unclaimed fees are excluded; the Uniswap V4 positions locked at graduation are counted under Mercurifi Trade.',
  start: '2026-09-21',
  arc: { tvl },
}
