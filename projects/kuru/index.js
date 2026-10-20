const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Being sunset in favor of the Spot deployment below; remove once it holds no funds.
const MARGIN_ACCOUNT = '0x2A68ba1833cDf93fa9Da1EEbd7F46242aD8E90c5'
const ROUTER = '0xd651346d7c789536ebf06dc72aE3C8502cd695CC'
const START_BLOCK = 33384150

const ACCOUNT_CORE = '0x264123a9B96Cc1193944cC25C188f1bD3dFa670e'
const SPOT_ROUTER = '0xBdDF3556701B7ECca5d69416CFfd7F86D37E52b3'
const SPOT_START_BLOCK = 113624576

const MARKET_REGISTERED_EVENT = 'event MarketRegistered(address baseAsset, address quoteAsset, address market, address vaultAddress, uint32 pricePrecision, uint96 sizePrecision, uint32 tickSize, uint96 minSize, uint96 maxSize, uint256 takerFeeBps, uint256 makerFeeBps, uint96 kuruAmmSpread)'
const SPOT_MARKET_REGISTERED_EVENT = 'event SpotMarketRegistered(address indexed orderBook, address indexed baseToken, address indexed quoteToken, address operator, uint96 sizePrecision, uint32 pricePrecision, uint96 minQuoteNotional, uint32 tickSize, uint32 passiveSpreadTicks, uint8 quoteTokenDecimals, uint256 takerFeePps, uint256 makerFeePps)'

async function tvl(api) {
  const [markets, spotMarkets] = await Promise.all([
    getLogs2({ api, target: ROUTER, eventAbi: MARKET_REGISTERED_EVENT, fromBlock: START_BLOCK, useIndexer: true }),
    getLogs2({ api, target: SPOT_ROUTER, eventAbi: SPOT_MARKET_REGISTERED_EVENT, fromBlock: SPOT_START_BLOCK, useIndexer: true }),
  ])

  const tokensAndOwners = [
    ...markets.flatMap(({ baseAsset, quoteAsset }) => [[baseAsset, MARGIN_ACCOUNT], [quoteAsset, MARGIN_ACCOUNT]]),
    ...spotMarkets.flatMap(({ baseToken, quoteToken }) => [[baseToken, ACCOUNT_CORE], [quoteToken, ACCOUNT_CORE]]),
  ]

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'TVL counts all tokens deposited in the Kuru AccountCore contract and, until it is retired, the earlier MarginAccount contract. Markets are discovered from SpotRouter.SpotMarketRegistered and Router.MarketRegistered events. Native MON is address(0).',
  monad: {
    tvl,
  },
}
