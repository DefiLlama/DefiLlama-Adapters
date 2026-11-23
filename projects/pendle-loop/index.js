const { getLogs2 } = require('../helper/cache/getLogs')

// Same addresses on every chain
const LOOPER = '0xF82Ef4080A53b71093f9c470676Fc80E2ADC4263'
const LOOPER_VIEW = '0x887b00B5F584f1cC015e8f68C29d6Feb6bf95b02'
const BOX_FACTORY = '0xe5125dfE3Fc232723E7Ae17cFa66034b3BCAC696'

const config = {
  ethereum: { fromBlock: 25529371 },
  arbitrum: { fromBlock: 491662229 },
  base: { fromBlock: 52757118 },
  plasma: { fromBlock: 27074014 },
  xlayer: { fromBlock: 69388397 },
  robinhood: { fromBlock: 98117595 },
  monad: { fromBlock: 88900541 },
}

const abi = {
  PositionIncreased: 'event PositionIncreased(address indexed owner, bytes32 indexed boxId, bytes32 requestHash, uint256 nonce, uint256 preInBalance, uint256 netPtToMM, uint256 postDebtBalance)',
  moneyMarketView: 'function moneyMarketView(address spokeMMBeacon) view returns (address)',
  computePositionBox: 'function computePositionBox(address owner, bytes32 boxId) view returns (address box, bytes32 salt, bool deployed)',
  moneyMarketBalances: 'function moneyMarketBalances(address box) returns (uint256 mmPtBalance, uint256 mmDebtBalance)',
  boxData: 'function boxData(bytes32 boxId) view returns ((uint32 hubChainId, uint32 spokeChainId, address hubPt, address hubDebtToken, address spokePt, address spokeDebtToken, address spokeMMBeacon, bytes32 mmPayload))',
  getAll: 'function getAll(address owner, bytes32 boxId) returns ((uint256 mmPtBalance, uint256 mmDebtBalance, uint256 ltv, uint256 liquidationThreshold, uint256 borrowingLiquidity, uint256 lendingLiquidity, (address token, uint256 claimable)[] borrowingRewards, (address token, uint256 claimable)[] lendingRewards, (uint256 minBorrowing, uint256 maxBorrowing, uint256 minBorrowingForRewards, uint256 minLending, uint256 maxLending, uint256 minLendingForRewards) limits, uint256 borrowingRate, uint256 lendingRate, uint256 ptDebtRateWad))',
}

// A position is one (owner, boxId) pair. Its collateral and debt sit in a money market (Morpho, Aave, Euler, ...)
// under a per-position account, and the looper view reads the collateral balance from the money market.
async function tvl(api) {
  const { fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, target: LOOPER, eventAbi: abi.PositionIncreased, fromBlock })
  const seen = new Set()
  const positions = []
  logs.forEach(({ owner, boxId }) => {
    const key = `${owner}-${boxId}`.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    positions.push({ owner, boxId })
  })

  const boxIds = [...new Set(positions.map(p => p.boxId))]
  const boxes = await api.multiCall({ abi: abi.boxData, target: BOX_FACTORY, calls: boxIds, permitFailure: true })
  const boxById = Object.fromEntries(boxIds.map((id, i) => [id, boxes[i]]))

  const balances = await api.multiCall({ abi: abi.getAll, target: LOOPER_VIEW, calls: positions.map(p => ({ params: [p.owner, p.boxId] })), permitFailure: true })
  const failed = []
  balances.forEach((balance, i) => {
    if (!boxById[positions[i].boxId]) return
    if (balance) api.add(boxById[positions[i].boxId].spokePt, balance.mmPtBalance)
    else failed.push(positions[i])
  })
  if (!failed.length) return

  // getAll also reads ltv/rates, so it reverts for a whole box when the money market's oracle does (eg. FeedDeviation).
  // The collateral balance does not need the oracle: read it from the money market view of the box.
  const beacons = [...new Set(failed.map(p => boxById[p.boxId].spokeMMBeacon))]
  const mmViews = await api.multiCall({ abi: abi.moneyMarketView, target: LOOPER_VIEW, calls: beacons, permitFailure: true })
  const mmViewByBeacon = Object.fromEntries(beacons.map((beacon, i) => [beacon, mmViews[i]]))
  const boxAddresses = await api.multiCall({ abi: abi.computePositionBox, target: BOX_FACTORY, calls: failed.map(p => ({ params: [p.owner, p.boxId] })), permitFailure: true })
  const retry = failed.map((p, i) => ({ ...p, box: boxAddresses[i]?.box, mmView: mmViewByBeacon[boxById[p.boxId].spokeMMBeacon] })).filter(p => p.box && p.mmView)
  const mmBalances = await api.multiCall({ abi: abi.moneyMarketBalances, calls: retry.map(p => ({ target: p.mmView, params: [p.box] })), permitFailure: true })
  mmBalances.forEach((balance, i) => {
    if (balance) api.add(boxById[retry[i].boxId].spokePt, balance.mmPtBalance)
  })
}

module.exports = {
  doublecounted: true,
  methodology: 'PendleLoop opens leveraged positions on Pendle PTs and other yield-bearing tokens through lending markets (Morpho, Aave, Euler and others). TVL is the collateral of every position. The collateral is held in the lending markets and PT collateral is also part of Pendle TVL, so the listing is doublecounted.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
