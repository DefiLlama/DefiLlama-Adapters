const sdk = require('@defillama/sdk')
const { ethers } = require('ethers')

/**
 * Anchored issues tokenized US stocks/ETFs (`aAAPL`, `aSPY`, ...) and tokenized
 * funds (`aDHF`, `aLSF`, `aAIF`). Every token is an ERC20 backed 1:1 by the
 * underlying held in regulated custody, so TVL is the onchain supply of those
 * tokens valued at the reference price published onchain by Anchored's own
 * oracle contracts.
 *
 * Nothing here is hardcoded per asset: the stock tokens are enumerated from the
 * onchain token factory and the funds from the onchain fund controller, so
 * newly issued assets are picked up without an adapter change.
 */

// Deployed at the same deterministic address on every supported chain.
const TOKEN_FACTORY = '0x500769f4544c5cc75436a615101f27ff4350469a'
const STOCK_ORACLE = '0x037848af338c38e1e0ab722be80bf4c2e612a1f7'

// Funds are issued on Ethereum only.
const FUND_CONTROLLER = '0xfdc272fd757075388e35f8ddab42fac510b87e73'
const FUND_NAV_RECORD = '0x66a534c68f27e5523081243b7fa02e68711a1a04'

// The stock oracle carries a registered priceId per underlying ticker on this
// chain; prices are the same reference price on every chain the token exists on.
const PRICE_CHAIN = 'arbitrum'

const PRICE_DECIMALS = 8
const NAV_DECIMALS = 6

// The nav registry keeps its record counter private, so its gapless 1-based
// sequence is probed in windows until the first miss. Funds need no such scan:
// the controller exposes its own counter.
const NAV_SCAN_WINDOW = 100

const abi = {
  tokenCount: 'function tokenCount() view returns (uint16)',
  tokenAtIndex: 'function tokenAtIndex(uint16 index) view returns (address)',
  latestPrice:
    'function latestPrice(bytes32 priceId) view returns ((int128 price, int128 bestBid, int128 bestAsk, uint64 feedUpdateTimestamp, uint64 publishedAt, uint80 roundId, uint8 session))',
  nextFundId: 'function nextFundId() view returns (uint16)',
  fundConfigs:
    'function fundConfigs(uint16 fundId) view returns ((uint16 index, uint16 feeBps, address shareToken, uint64 subscriptionWindow, uint64 currentRedemptionSchedule, uint64 nextRedemptionSchedule, uint32 minSubscriptionUsd))',
  getNavRecord:
    'function getNavRecord(uint64 navRecordId) view returns (uint16 fundId, uint128 nav, uint32 sourceUpdatedAt, uint32 recordedAt)',
}

const field = (result, name, index) => (Array.isArray(result) ? result[index] : result[name])

async function addStocks(api) {
  const tokens = await api.fetchList({
    lengthAbi: abi.tokenCount,
    itemAbi: abi.tokenAtIndex,
    target: TOKEN_FACTORY,
  })

  const [supplies, symbols, decimals] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: tokens }),
    api.multiCall({ abi: 'erc20:symbol', calls: tokens }),
    api.multiCall({ abi: 'erc20:decimals', calls: tokens }),
  ])

  // `aAAPL` tracks `AAPL`; the oracle keys each asset by keccak256 of the
  // uppercase underlying ticker.
  const priceIds = symbols.map((symbol) => ethers.id(symbol.replace(/^a/, '').toUpperCase()))

  const priceApi =
    api.chain === PRICE_CHAIN ? api : new sdk.ChainApi({ chain: PRICE_CHAIN, timestamp: api.timestamp })
  // permitFailure covers the odd ticker that has no registered priceId yet; a
  // reverted read for every one of them means the oracle itself is unreachable,
  // which must not be reported as an empty chain.
  const payloads = await priceApi.multiCall({
    target: STOCK_ORACLE,
    abi: abi.latestPrice,
    calls: priceIds,
    permitFailure: true,
  })
  if (tokens.length && !payloads.some((payload) => payload))
    throw new Error(`Anchored: no price resolved on ${PRICE_CHAIN} for any of ${tokens.length} tokens`)

  supplies.forEach((supply, i) => {
    const payload = payloads[i]
    if (!payload || !supply) return
    const price = Number(field(payload, 'price', 0)) / 10 ** PRICE_DECIMALS
    if (!(price > 0)) return
    api.addUSDValue((Number(supply) / 10 ** Number(decimals[i])) * price)
  })
}

async function addFunds(api) {
  // Fund ids are handed out from a 1-based counter, so the registry is exactly
  // 1..nextFundId-1 with no gaps and no scanning.
  const nextFundId = Number(await api.call({ target: FUND_CONTROLLER, abi: abi.nextFundId }))
  if (nextFundId < 2) return

  const configs = await api.multiCall({
    target: FUND_CONTROLLER,
    abi: abi.fundConfigs,
    calls: [...Array(nextFundId - 1).keys()].map((i) => i + 1),
  })

  const shareTokens = {}
  configs.forEach((config, i) => {
    if (!config) return
    const shareToken = field(config, 'shareToken', 2)
    if (!shareToken || shareToken === ethers.ZeroAddress) return
    shareTokens[i + 1] = shareToken
  })
  if (!Object.keys(shareTokens).length) return

  const navs = await latestNavs(api)
  const funds = Object.entries(shareTokens).filter(([fundId]) => navs[fundId] !== undefined)
  // Every live fund has published at least one nav, so an empty result means the
  // registry read failed rather than that the funds are worth nothing.
  if (!funds.length)
    throw new Error(`Anchored: no nav record found for any of ${Object.keys(shareTokens).length} funds`)

  const [supplies, decimals] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: funds.map(([, token]) => token) }),
    api.multiCall({ abi: 'erc20:decimals', calls: funds.map(([, token]) => token) }),
  ])

  funds.forEach(([fundId], i) => {
    if (!supplies[i]) return
    const nav = Number(navs[fundId]) / 10 ** NAV_DECIMALS
    if (!(nav > 0)) return
    api.addUSDValue((Number(supplies[i]) / 10 ** Number(decimals[i])) * nav)
  })
}

/**
 * The nav registry keys records by an incrementing id shared by all funds and
 * exposes neither the counter nor a per-fund pointer, so the sequence is walked
 * until it runs out and the last record seen for each fund wins.
 */
async function latestNavs(api) {
  const navs = {}
  for (let start = 1; ; start += NAV_SCAN_WINDOW) {
    const records = await api.multiCall({
      target: FUND_NAV_RECORD,
      abi: abi.getNavRecord,
      calls: [...Array(NAV_SCAN_WINDOW).keys()].map((i) => start + i),
      permitFailure: true,
    })

    let found = 0
    records.forEach((record) => {
      if (!record) return
      found++
      navs[Number(field(record, 'fundId', 0))] = field(record, 'nav', 1)
    })

    if (found < NAV_SCAN_WINDOW) return navs
  }
}

const tvl = async (api) => {
  await addStocks(api)
  if (api.chain === 'ethereum') await addFunds(api)
}

module.exports = {
  methodology:
    'TVL = sum of (tokenized stock supply x oracle price) + sum of (fund share supply x latest NAV per share). Stocks and ETFs are enumerated per chain from the AncTokenFactory registry and valued with StockOracle.latestPrice, keyed by keccak256 of the uppercase underlying ticker. Funds are enumerated from AncFundController on Ethereum and valued at the latest NAV per share published to AncFundNavRecord. Nothing is hardcoded and no Anchored API is called: both the asset list and the prices come from contract reads, so newly issued assets are picked up without an adapter change. Every token is backed 1:1 by the underlying share or fund interest held in regulated custody, and reserves are attested independently at https://accountable.anchored.finance.',
  ethereum: { tvl },
  monad: { tvl },
  base: { tvl },
  arbitrum: { tvl },
}
