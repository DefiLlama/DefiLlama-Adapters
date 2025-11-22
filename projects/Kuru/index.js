const { getLogs } = require('../helper/cache/getLogs')

const MARGIN_ACCOUNT = '0x2A68ba1833cDf93fa9Da1EEbd7F46242aD8E90c5'
const ROUTER = '0xd651346d7c789536ebf06dc72aE3C8502cd695CC'
const START_BLOCK = 33384150
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const MARKET_REGISTERED_EVENT = 'event MarketRegistered(address baseAsset, address quoteAsset, address market, address vaultAddress, uint32 pricePrecision, uint96 sizePrecision, uint32 tickSize, uint96 minSize, uint96 maxSize, uint256 takerFeeBps, uint256 makerFeeBps, uint96 kuruAmmSpread)'

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: ROUTER,
    eventAbi: MARKET_REGISTERED_EVENT,
    fromBlock: START_BLOCK,
    onlyArgs: true,
  })

  // Extract unique tokens from market events
  const seen = new Set()
  const tokens = []

  for (const { baseAsset, quoteAsset } of logs) {
    if (baseAsset && baseAsset !== ZERO_ADDRESS) {
      const key = baseAsset.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        tokens.push(baseAsset)
      }
    }
    if (quoteAsset && quoteAsset !== ZERO_ADDRESS) {
      const key = quoteAsset.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        tokens.push(quoteAsset)
      }
    }
  }

  return api.sumTokens({ owner: MARGIN_ACCOUNT, tokens })
}

module.exports = {
  methodology: 'TVL counts all tokens deposited in the Kuru MarginAccount contract. Market listings are discovered from Router.MarketRegistered events.',
  monad: {
    tvl,
  },
}
