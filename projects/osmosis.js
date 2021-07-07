const utils = require('./helper/utils')

const cosmosId = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
const NUM_RUNS = 4

function setAssetPrice(assetPrices, token, otherToken, amount, otherAmount, weight, otherWeight){
    if(assetPrices[token]){
        return
    }
    const priceDiff = (otherAmount*weight)/(amount*otherWeight)
    if(otherToken === cosmosId){
        assetPrices[token] = priceDiff
    }
    if(assetPrices[otherToken]){
        assetPrices[token] = priceDiff * assetPrices[otherToken]
    }
}

async function fetch(){
    const pools = (await utils.fetchURL("https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools")).data.pools
    const cosmosPrice = await utils.getPricesfromString("cosmos")

    const assetPrices = {
        [cosmosId]: 1
    }
    let totalCosmosTvl = 0
    for(let i=0; i<NUM_RUNS; i++){
        pools.forEach(pool=>{
            const token0 = pool.poolAssets[0].token.denom 
            const token1 = pool.poolAssets[1].token.denom 
            const amount0 = Number(pool.poolAssets[0].token.amount)
            const weight0 = Number(pool.poolAssets[0].weight)
            const amount1 = Number(pool.poolAssets[1].token.amount)
            const weight1 = Number(pool.poolAssets[1].weight)
            setAssetPrice(assetPrices, token0, token1, amount0, amount1, weight0, weight1)
            setAssetPrice(assetPrices, token1, token0, amount1, amount0, weight1, weight1)
            if(i === (NUM_RUNS-1)){
                totalCosmosTvl += amount0 * assetPrices[token0] / 1e6
                totalCosmosTvl += amount1 * assetPrices[token1] / 1e6
            }
        })
    }
    return cosmosPrice.data.cosmos.usd * totalCosmosTvl
}

module.exports = {
    methodology: "Counts the liquidity on all AMM pools. The price of each token is determined in the following way: First we check if there's a pool between ATOM and the token we want to price, and if there is one we just take the price on that pool. If there's none, we find another pair where the token is one of assets and we know the price of the other asset, and then extract token price from that. By repeating these steps multiple times we can price all the assets against ATOM, and once that is done we fetch the price of ATOM from coingecko and calculate the TVL by adding up the amounts of tokens locked multiplied by their price against ATOM times the price of ATOM in USD (from coingecko).",
    fetch
}