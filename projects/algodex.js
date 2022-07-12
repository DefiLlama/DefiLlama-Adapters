const { fetchURL } = require('./helper/utils')
const { toUSDTBalances } = require('./helper/balances')

const usdPriceUrl = "https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/"
const algoPriceUrl = "https://eu-central-1.algodex.com/algodex-backend/assets.php"
const assetTVLURL = "https://eu-central-1.algodex.com/algodex-backend/tvl.php"

async function fetch() {
  const tvlData = await fetchURL(assetTVLURL)
  const usdPriceData = await fetchURL(usdPriceUrl)
  const algoPriceData = await fetchURL(algoPriceUrl)

  const algoPrices = algoPriceData.data.data.reduce((obj, item) => {
    if (item.hasOwnProperty("price")) {
        obj[item.id] = item.price
    }
    return obj
  }, {})

  const total_liquidity_in_usd = tvlData.data.reduce((sum, asset) => {
    var assetPrice = 0
    if (usdPriceData.data.hasOwnProperty(asset.assetid)) {
      assetPrice = usdPriceData.data[asset.assetid].price
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
  fetch
}
