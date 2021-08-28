const axios = require('axios')
const BigNumber = require('bignumber.js')

const url = "https://terraswap-graph.terra.dev/graphql?query="
const ust = "0xa47c8bf37f92abed4a126bda807a7b7498661acd"

function getClosest(timestamp, array, timestampProperty){
    let closest = array[0]
    array.forEach(dayTvl => {
      if (Math.abs(dayTvl[timestampProperty] - timestamp) < Math.abs(closest[timestampProperty] - timestamp)) {
        closest = dayTvl
      }
    })
    if(Math.abs(closest[timestampProperty] - timestamp) > 3600*24){ // Oldest data is too recent
        throw new Error("Too old");
    }
    return closest
}

async function tvl(timestamp){
    const query = `      {        terraswap {          historicalData(          to: ${timestamp},          from: 1586974156,          ){            timestamp,            volumeUST,            liquidityUST          }        }      }`
    const result = (await axios.get(url+encodeURIComponent(query))).data.data.terraswap.historicalData
    const closest = getClosest(timestamp, result, "timestamp")
    return {
        [ust]: BigNumber(closest.liquidityUST).times(1e12).toFixed(0)
    }
}

module.exports={
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    tvl
}
