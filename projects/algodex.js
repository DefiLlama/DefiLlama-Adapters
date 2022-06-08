const { fetchURL } = require('./helper/utils')
const { toUSDTBalances } = require('./helper/balances')
// const fs = require("fs")

const usdPriceUrl = "https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/"
const algoPriceUrl = "https://app.algodex.com/algodex-backend/assets.php"
const assetVolURL = "https://app.algodex.com/algodex-backend/tvl.php"
// const assetVolURL = "http://localhost/algodex-backend/tvl.php"

async function tvl() {
    const volumData = await fetchURL(assetVolURL)
    const usdPriceData = await fetchURL(usdPriceUrl)
    const algoPriceData = await fetchURL(algoPriceUrl)

    const algoPrices = algoPriceData.data.data.reduce((obj, item) => {
        if (item.hasOwnProperty("price")) {
            obj[item.id] = item.price
        }
        return obj
    }, {})



    var total_liquidity_in_usd = 0

    volumData.data.map((asset) => {

        var assetPrice = 0

        if (usdPriceData.data.hasOwnProperty(asset.assetid)) {
            // console.log("Tinyprice: ", assetId)
            assetPrice = usdPriceData.data[asset.assetid].price

        } else {
            // price for some asset is not found on tinyman then
            // set its price to zero

            assetPrice = 0

        }


        var total = assetPrice * asset.asaAmountTotal
        total_liquidity_in_usd = total_liquidity_in_usd + total
    })

    return toUSDTBalances(total_liquidity_in_usd)
}
module.exports = {
    misrepresentedTokens: true,
    algodex: {
        tvl
    }
}