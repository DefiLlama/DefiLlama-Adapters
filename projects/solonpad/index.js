const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xd6b86b9B1bB64b941b21AaA6a0e3A673e8405A3b'
const FEE_SPLITTER = '0xd6b05564cea990b69abf10b433279093758e2a54'
const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const USDC = ADDRESSES.null // native USDC (gas token, 18 decimals)
const SOLON = '0xd36687146385F7Dc84A18FEA3D00319d39D6d1a0'
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

// Solon .sol stock tokens: their backing is counted under solon-stocks
const SOLON_STOCKS = new Set([
  '0x2312290792Cf429605D09A42Fa43dAB810486c18', // NVDA.sol
  '0x785415d2994222533E3A0ECa9FE95Cc41623d9cf', // AAPL.sol
  '0xAF91A1f046d7ab339b7FF71C0f4D9c166eB1f308', // TSLA.sol
].map(i => i.toLowerCase()))

const SOLON_STAKING = [
  '0xd20A87639B5a3e86a815627e468072C3a3276172', // SolonStakingV2
  '0xB3E0b89b3Ba098D83072dd60c1946CFB3231688f', // original SOLON staking pool
]

const positionInfoAbi = 'function getPoolAndPositionInfo(uint256) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 info)'

const isSolonPool = ({ currency0, currency1 }) => [currency0, currency1].some(i => i.toLowerCase() === SOLON.toLowerCase())

// Launch positions held by the FeeSplitter, split into the SOLON/USDC pool (pool2) and the other launches (tvl).
// The V4 PositionManager has no enumeration, so token ids come from Transfer logs and are re-verified with ownerOf.
async function feeSplitterPositions(api) {
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, fromBlock: 21153856,
    eventAbi: 'event Transfer(address indexed from, address indexed to, uint256 indexed id)',
    topics: [TRANSFER_TOPIC, null, '0x' + FEE_SPLITTER.slice(2).padStart(64, '0')],
  })
  const ids = [...new Set(transfers.map(i => i.id.toString()))]
  const owners = await api.multiCall({ target: POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const positionIds = ids.filter((_, i) => owners[i]?.toLowerCase() === FEE_SPLITTER)
  if (!positionIds.length) return { solon: [], others: [] }
  const infos = await api.multiCall({ target: POSITION_MANAGER, abi: positionInfoAbi, calls: positionIds })
  return {
    solon: positionIds.filter((_, i) => isSolonPool(infos[i].poolKey)),
    others: positionIds.filter((_, i) => !isSolonPool(infos[i].poolKey)),
  }
}

function addV4Positions(api, positionIds, whitelistedTokens) {
  if (!positionIds.length) return
  return sumTokens2({
    api, resolveUniV4: true,
    uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens },
  })
}

async function tvl(api) {
  // 1. Quote asset held by live (non-graduated) bonding curves, read as balances.
  const launches = await getLogs2({
    api, target: FACTORY, fromBlock: 21134269,
    eventAbi: 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
  })
  const graduated = await api.multiCall({ abi: 'bool:graduated', calls: launches.map(i => i.curve) })
  const tokensAndOwners = launches
    .filter((i, idx) => !graduated[idx] && !SOLON_STOCKS.has(i.pairToken.toLowerCase()))
    .map(i => [i.pairToken, i.curve])
  await sumTokens2({ api, tokensAndOwners })

  // 2. USDC side of the permanently locked launch positions held by the FeeSplitter (the SOLON/USDC pool is pool2).
  const { others } = await feeSplitterPositions(api)
  await addV4Positions(api, others, [USDC])
}

async function staking(api) {
  const staked = await api.multiCall({ abi: 'uint256:totalStaked', calls: SOLON_STAKING })
  staked.forEach(i => api.add(SOLON, i))
}

async function pool2(api) {
  const { solon } = await feeSplitterPositions(api)
  await addV4Positions(api, solon, [])
}

module.exports = {
  methodology: 'TVL is the quote asset (native USDC) held by non-graduated bonding curves plus the USDC side of the permanently locked Uniswap V4 launch positions held by the FeeSplitter, enumerated from PositionManager Transfer events and re-verified with ownerOf. Launched tokens and uncollected trading fees are excluded. Staking is the SOLON staked in SolonStakingV2 and the original SOLON staking pool (principal only). Pool2 is both sides of the protocol-owned, permanently locked SOLON/USDC pool. Marked doublecounted because the locked positions already sit inside Uniswap V4 TVL on Arc.',
  doublecounted: true,
  arc: { tvl, staking, pool2 },
}
