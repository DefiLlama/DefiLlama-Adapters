const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const USDC = ADDRESSES.null // native USDC (gas token, 18 decimals)
const V3_LP_LOCKER = '0x09650Be5c4866971aBbD5C9e92AE495A118fD13F'
const V3_DEPLOY_BLOCK = 23985516
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

async function tvl(api) {
  // The V4 PositionManager has no enumeration, so token ids come from Transfer logs and are re-verified with ownerOf
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, fromBlock: V3_DEPLOY_BLOCK, extraKey: 'solonpad-v3-locker',
    eventAbi: 'event Transfer(address indexed from, address indexed to, uint256 indexed id)',
    topics: [TRANSFER_TOPIC, null, '0x' + V3_LP_LOCKER.slice(2).toLowerCase().padStart(64, '0')],
  })
  const ids = [...new Set(transfers.map(i => i.id.toString()))]
  const owners = await api.multiCall({ target: POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const positionIds = ids.filter((_, i) => owners[i]?.toLowerCase() === V3_LP_LOCKER.toLowerCase())
  if (!positionIds.length) return

  // Stock-quoted launches (NVDA.sol, AAPL.sol, TSLA.sol) are not counted here: their backing is counted under solon-stocks
  return sumTokens2({
    api, resolveUniV4: true,
    uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens: [USDC] },
  })
}

module.exports = {
  methodology: 'TVL is the USDC side of the launch positions permanently locked in the V3LPLocker, enumerated from PositionManager Transfer events and re-verified with ownerOf. Launched tokens are not counted. The stock-token side of stock-quoted launches is not counted here, since the stock backing those tokens is counted under Solon Stocks. Marked doublecounted because the locked positions already sit inside Uniswap V4 TVL on Arc.',
  doublecounted: true,
  start: '2026-10-03',
  arc: { tvl },
}
