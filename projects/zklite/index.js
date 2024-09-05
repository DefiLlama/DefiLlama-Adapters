const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')

async function offers() {
  const markets = await get('https://api.zklite.io/api/v1/markets')
  const marketInfos = await get('https://api.zklite.io/api/v1/marketinfos?chain_id=1&market=' + Object.keys(markets).join(','))
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
  }
}
