const { fetchURL } = require('./helper/utils')
const { toUSDTBalances } = require('./helper/balances')

const usdPriceUrl = "https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/"
const assetTVLURL = "https://app.algodex.com/api/v2/orders/tvl"

async function fetch() {
  const tvlData = await fetchURL(assetTVLURL)
  const usdPriceData = await fetchURL(usdPriceUrl)

  const total_liquidity_in_usd = tvlData.data.reduce((sum, asset) => {
    var assetPrice = 0
    if (usdPriceData.data[asset.assetId]) {
      assetPrice = usdPriceData.data[asset.assetId].price
    } else {
      // price for some asset is not found on tinyman then
      // set its price to zero
      assetPrice = 0
    }

    sum += assetPrice * asset.asaAmountTotal
    return sum
  }, 0)
  return total_liquidity_in_usd 
}
// tvl in USD
module.exports = {
  algorand: {
    fetch
  },
  fetch
}
