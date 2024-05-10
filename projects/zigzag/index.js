const ADDRESSES = require('../helper/coreAssets.json')
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
    offers: () => ({}),
    tvl: async () => ({})
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xf4037f59c92c9893c43c2372286699430310cfe7', tokens: [
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.WBTC,
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.LINK,
    ]})
  }
}
