const { getLogs } = require('../helper/cache/getLogs')
const { getBorrowedByMarket, getOnchainTvlByToken } = require('./helpers')

const MORPHO_API = process.env.MORPHO_MIDNIGHT_API ?? 'https://api.morpho.org'
const MORPHO_API_VERSION = process.env.MORPHO_MIDNIGHT_API_VERSION ?? 'v0'
const config = {
  base: {
    chainId: 8453,
    midnight: '0xAdedD8ab6dE832766Fedf0FaC4992E5C4D3EA18A',
    fromBlock: 48286884,
  },
}

const eventAbis = {
  marketCreated: 'event MarketCreated((uint256 chainId,address midnight,address loanToken,(address token,uint256 lltv,uint256 liquidationCursor,address oracle)[] collateralParams,uint256 maturity,uint256 rcfThreshold,address enterGate,address liquidatorGate) market,bytes32 indexed id_)',
  take: 'event Take(address caller,bytes32 offerHash,bytes32 indexed id_,bool offerIsBuy,address indexed maker,bytes32 group,address ratifier,bytes ratifierData,uint256 units,address indexed taker,uint256 buyerAssets,uint256 sellerAssets,uint256 consumed,uint256 buyerPendingFeeIncrease,uint256 sellerPendingFeeDecrease,int256 totalUnitsDelta,address receiver,address payer)',
  withdraw: 'event Withdraw(address caller,bytes32 indexed id_,uint256 units,address indexed onBehalf,address indexed receiver,uint256 pendingFeeDecrease)',
  repay: 'event Repay(address indexed caller,bytes32 indexed id_,uint256 units,address indexed onBehalf,address payer)',
  supplyCollateral: 'event SupplyCollateral(address caller,bytes32 indexed id_,address indexed collateral,uint256 assets,address indexed onBehalf)',
  withdrawCollateral: 'event WithdrawCollateral(address caller,bytes32 indexed id_,address indexed collateral,uint256 assets,address indexed onBehalf,address receiver)',
  liquidate: 'event Liquidate(address caller,bytes32 indexed id_,address indexed collateral,uint256 seizedAssets,uint256 repaidUnits,address indexed borrower,bool postMaturityMode,address receiver,address payer,uint256 badDebt,uint256 latestLossFactor,uint256 latestContinuousFeeCredit)',
  claimContinuousFee: 'event ClaimContinuousFee(address indexed caller,bytes32 indexed id_,uint256 amount,address indexed receiver)',
}

function apiUrl(path) {
  return `${MORPHO_API}/${MORPHO_API_VERSION}/midnight${path}`
}

async function getEventLogs(api, event) {
  const { midnight, fromBlock } = config[api.chain]
  return getLogs({
    api,
    target: midnight,
    eventAbi: eventAbis[event],
    fromBlock,
    onlyArgs: true,
    extraKey: `morpho-midnight-${event}-v1`,
  })
}

async function getMarkets(api) {
  const logs = await getEventLogs(api, 'marketCreated')
  return new Map(logs.map(log => [log.id_.toLowerCase(), log.market]))
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Morpho API ${response.status}: ${url}`)
  const body = await response.json()
  if (!body || !Array.isArray(body.data)) throw new Error(`Invalid Morpho API response: ${url}`)
  return body
}

async function paginate(path, params) {
  const rows = []
  const seenCursors = new Set()
  let cursor
  do {
    const query = new URLSearchParams({ ...params })
    if (cursor) query.set('cursor', cursor)
    const body = await fetchJson(apiUrl(`${path}?${query}`))
    rows.push(...body.data)
    cursor = body.cursor ?? undefined
    if (cursor && seenCursors.has(cursor)) throw new Error(`Morpho API returned a repeated cursor for ${path}`)
    if (cursor) seenCursors.add(cursor)
  } while (cursor)
  return rows
}

// Launch scope: only markets flagged `listed` by the Morpho API trust layer. This is a single
// filter that can be dropped later to cover every Midnight market (DefiLlama blacklist-style).
async function getListedMarketIds(api) {
  const { chainId } = config[api.chain]
  const markets = await paginate('/markets', { chain_ids: String(chainId), listed: 'true', limit: '100' })
  return new Set(markets.map(market => market.market_id.toLowerCase()))
}

// Listed market ids intersected with markets actually created on the configured Midnight
// contract, so a listing entry from another deployment can never widen scope.
async function getListedMarkets(api) {
  const [markets, listedIds] = await Promise.all([getMarkets(api), getListedMarketIds(api)])
  const listed = new Map()
  for (const [id, market] of markets)
    if (listedIds.has(id)) listed.set(id, market)
  return listed
}

async function tvl(api) {
  const [markets, suppliedCollateral, withdrawnCollateral, liquidations, repays, withdrawals, claimedContinuousFees] = await Promise.all([
    getListedMarkets(api),
    getEventLogs(api, 'supplyCollateral'),
    getEventLogs(api, 'withdrawCollateral'),
    getEventLogs(api, 'liquidate'),
    getEventLogs(api, 'repay'),
    getEventLogs(api, 'withdraw'),
    getEventLogs(api, 'claimContinuousFee'),
  ])
  const keep = logs => logs.filter(log => markets.has(log.id_.toLowerCase()))
  const balances = getOnchainTvlByToken({
    markets,
    suppliedCollateral: keep(suppliedCollateral),
    withdrawnCollateral: keep(withdrawnCollateral),
    liquidations: keep(liquidations),
    repays: keep(repays),
    withdrawals: keep(withdrawals),
    claimedContinuousFees: keep(claimedContinuousFees),
  })
  for (const [token, amount] of balances)
    if (amount > 0n) api.add(token, amount.toString())
}

async function borrowed(api) {
  const [markets, takes, repays, liquidations] = await Promise.all([
    getListedMarkets(api),
    getEventLogs(api, 'take'),
    getEventLogs(api, 'repay'),
    getEventLogs(api, 'liquidate'),
  ])
  const keep = logs => logs.filter(log => markets.has(log.id_.toLowerCase()))
  for (const [marketId, amount] of getBorrowedByMarket(keep(takes), keep(repays), keep(liquidations))) {
    if (amount === 0n) continue
    const market = markets.get(marketId)
    if (!market) throw new Error(`Missing Midnight market ${marketId}`)
    api.add(market.loanToken, amount.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Scope is limited to markets currently flagged listed by the Morpho API trust layer; the same listed set gates both TVL and borrowed. TVL is value custodied by the Midnight contract, reconstructed purely from onchain events: collateral deposited in Midnight plus repaid loan liquidity not yet withdrawn. Borrowed is active face-value debt reconstructed from Take events net of repayments, liquidations, and realized bad debt. Matured markets remain included until their collateral and repaid liquidity are withdrawn.',
  base: { tvl, borrowed },
}
