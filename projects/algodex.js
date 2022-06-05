const { fetchURL } = require('./helper/utils')
const { toUSDTBalances } = require('./helper/balances')
// const fs = require("fs")

const usdPriceUrl = "https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/"
const algoPriceUrl = "https://app.algodex.com/algodex-backend/assets.php"
const assetVolURL = "https://app.algodex.com/algodex-backend/tvl.php/"

// const rtprices = fs.readFileSync("/home/imran/Projects/algodex/DefiLlama-Adapters/tinyman_prices.json")
// const tp = JSON.parse(rtprices)

// const raprices = fs.readFileSync("/home/imran/Projects/algodex/DefiLlama-Adapters/algo_prices.json")
// const ap = JSON.parse(raprices)
// const algoPrices = ap.data.reduce((obj, item) => {
//     if (item.hasOwnProperty("price")) {
//         obj[item.id] = item.price
//     }
//     return obj
// }, {})

// const rawAlgoAmount = fs.readFileSync("/home/imran/Projects/algodex/DefiLlama-Adapters/algo_amounts.json")
// const algoAmount = JSON.parse(rawAlgoAmount)

// function getPrice(assetId) {
//     var assetPrice = 0
//     if (tp.hasOwnProperty(assetId)) {
//         // console.log("Tinyprice: ", assetId)
//         assetPrice = tp[assetId].price

//     } else {

//         if (algoPrices.hasOwnProperty(assetId)) {
//             // console.log("Algoprice: ", assetId)
//             assetPrice = algoPrices[assetId]
//         }

//     }
//     return assetPrice
// }

async function tvl() {
    const volumData = await fetchURL(assetVolURL)
    const usdPriceData = await fetchURL(usdPriceUrl)
    const algoPriceData = await fetchURL(algoPriceUrl)

    const algoPrices = algoPriceData.data.reduce((obj, item) => {
        if (item.hasOwnProperty("price")) {
            obj[item.id] = item.price
        }
        return obj
    }, {})



    var total_liquidity_in_usd = 0
    volumData.map((asset) => {

        var assetPrice = 0

        if (usdPriceData.hasOwnProperty(asset.assetid)) {
            // console.log("Tinyprice: ", assetId)
            assetPrice = usdPriceData[asset.assetid].price

        } else {

            if (algoPrices.hasOwnProperty(asset.assetid)) {
                // console.log("Algoprice: ", assetId)
                assetPrice = algoPrices[asset.assetid]
            }

        }


        // var price = getPrice(asset.assetid)
        var total = assetPrice * asset.asaAmountTotal
        total_liquidity_in_usd = total_liquidity_in_usd + total
    })

    return toUSDTBalances(data.data.total_liquidity_in_usd)
}


// query for api 
// SELECT assetid,   Sum(asaAmount) asaAmountTotal FROM algodex.orderbook
// group by assetid
// union all 
// select 0 as assetId,  sum(algoAmount) from algodex.orderbook
// order by assetid



//    (asaAmount * tinyMan)
//    +
// Sum(algoAmount * tinyMan_USD_ALGO_Price)

// i need tinyman prices 
// https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/

// algoexplorer prices 
// https://price.algoexplorerapi.io/price/algo-usd

// for all assets whose usd prices are not available in tinyman , find prices from this api endpoint 
//  and multiply with price of asset 0 in tinyman api
// https://app.algodex.com/algodex-backend/assets.php
module.exports = {
    misrepresentedTokens: true,
    algodex: {
        tvl
    }
}