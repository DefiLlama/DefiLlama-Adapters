const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const USDC = ADDRESSES.null // native USDC (gas token, 18 decimals)
const V3_LP_LOCKER = '0x09650Be5c4866971aBbD5C9e92AE495A118fD13F' // V3.0 launches (2026-10-03 to 10-07)
const V3_DEPLOY_BLOCK = 23985516
const V31_FEE_SPLITTER = '0x985E396A2e7421cFF1A453d9E7B02cc91BCe1D55' // V3.1 launches (every launch since 2026-10-07)
const V31_DEPLOY_BLOCK = 24316034
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

// The V4 PositionManager has no enumeration, so token ids come from Transfer logs and are re-verified with ownerOf
async function lockedPositionIds(api, owner, fromBlock, extraKey) {
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, fromBlock, extraKey,
    eventAbi: 'event Transfer(address indexed from, address indexed to, uint256 indexed id)',
    topics: [TRANSFER_TOPIC, null, '0x' + owner.slice(2).toLowerCase().padStart(64, '0')],
  })
  const ids = [...new Set(transfers.map(i => i.id.toString()))]
  const owners = await api.multiCall({ target: POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i]?.toLowerCase() === owner.toLowerCase())
}

async function tvl(api) {
  const positionIds = [
    ...await lockedPositionIds(api, V3_LP_LOCKER, V3_DEPLOY_BLOCK, 'solonpad-v3-locker'),
    ...await lockedPositionIds(api, V31_FEE_SPLITTER, V31_DEPLOY_BLOCK, 'solonpad-v31-splitter'),
  ]
  if (!positionIds.length) return

  // Stock-quoted launches (NVDA.sol, AAPL.sol, TSLA.sol) are not counted here: their backing is counted under solon-stocks
  return sumTokens2({
    api, resolveUniV4: true,
    uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens: [USDC] },
  })
}

module.exports = {
  methodology: 'TVL is the USDC side of the launch positions permanently locked by the protocol: the V3LPLocker for V3.0 launches and the V31FeeSplitter for V3.1 launches (the serving stack since 2026-10-07), enumerated from PositionManager Transfer events and re-verified with ownerOf. Launched tokens are not counted. The stock-token side of stock-quoted launches is not counted here, since the stock backing those tokens is counted under Solon Stocks. Marked doublecounted because the locked positions already sit inside Uniswap V4 TVL on Arc.',
  doublecounted: true,
  start: '2026-10-03',
  arc: { tvl },
}
