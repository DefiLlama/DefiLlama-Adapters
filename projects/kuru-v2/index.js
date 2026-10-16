const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Monad mainnet (chain id 143). ERC-1967 proxies from the 15 October 2026 deployment.
// https://gist.github.com/devblixt/0093a81e9fc21b6c96e74ac3d3eb08e9
const ACCOUNT_CORE = '0x264123a9B96Cc1193944cC25C188f1bD3dFa670e'
const SPOT_ROUTER = '0xBdDF3556701B7ECca5d69416CFfd7F86D37E52b3'
const START_BLOCK = 113624576

const SPOT_MARKET_REGISTERED =
  'event SpotMarketRegistered(address indexed orderBook, address indexed baseToken, address indexed quoteToken, address operator, uint96 sizePrecision, uint32 pricePrecision, uint96 minQuoteNotional, uint32 tickSize, uint32 passiveSpreadTicks, uint8 quoteTokenDecimals, uint256 takerFeePps, uint256 makerFeePps)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: SPOT_ROUTER,
    eventAbi: SPOT_MARKET_REGISTERED,
    fromBlock: START_BLOCK,
    useIndexer: true,
  })

  const tokens = new Set()
  for (const { baseToken, quoteToken } of logs) {
    if (baseToken) tokens.add(baseToken)
    if (quoteToken) tokens.add(quoteToken)
  }

  return sumTokens2({ api, owner: ACCOUNT_CORE, tokens: Array.from(tokens) })
}

module.exports = {
  methodology:
    'TVL counts all tokens deposited in the Kuru V2 AccountCore contract, including reserved order balances and passive liquidity. Market listings are discovered from SpotRouter.SpotMarketRegistered events. Native MON is address(0).',
  monad: {
    tvl,
  },
}