const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')
const { sumTokensExport } = require('../helper/unwrapLPs')

async function offers() {
  const markets = await get('https://zigzag-exchange.herokuapp.com/api/v1/markets')
  const marketInfos = await get('https://zigzag-exchange.herokuapp.com/api/v1/marketinfos?chain_id=1&market=' + Object.keys(markets).join(','))
  let total = 0
  Object.keys(markets).forEach(market => {
    const info = marketInfos[market]
    const { baseVolume, quoteVolume } = markets[market]
    if (!info)  return;
    total += baseVolume * info.baseAsset.usdPrice + quoteVolume * info.quoteAsset.usdPrice
  })
  return toUSDTBalances(total)
}

module.exports = {
  timetravel: false,
  zksync: {
    offers,
    tvl: async () => ({})
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xf4037f59c92c9893c43c2372286699430310cfe7', tokens: [
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      '0x912CE59144191C1204E64559FE8253a0e49E6548',
      '0xf97f4df75117a78c1a5a0dbb814af92458539fb4',
    ]})
  }
}
