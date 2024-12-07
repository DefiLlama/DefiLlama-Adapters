const utils = require('../helper/utils')

async function tvl() {
  const poolPrices = await utils.fetchURL('https://static.plunderswap.com/PlunderswapPoolPrices.json')
  
  // Sum up tvlZIL from all pools
  var totalTvl = poolPrices?.data?.reduce((prev, curr) => prev + (Number(curr?.tvlZIL) ?? 0), 0)
  
  return {
    zilliqa: totalTvl
  }
}

module.exports = {
  zilliqa: {
    tvl,
  },
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Counts the tokens locked in PlunderSwap AMM pools to calculate TVL using pool prices from PlunderSwap API. TVL is calculated in ZIL. the https://static.plunderswap.com/PlunderswapPoolPrices.json is updated every 5 mins"
}