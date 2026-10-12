const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Monad mainnet (chain id 143). ERC-1967 proxy addresses.
const ACCOUNT_CORE = '0xA0Ba2f08c04C13190ad5dC74542ddc05C59AB516'
const SPOT_ROUTER = '0x7d08A7B163aadfA9FA8AEdFb40F41c0874376f7D'
const START_BLOCK = 112776229

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