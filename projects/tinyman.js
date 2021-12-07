const {fetchURL} = require('./helper/utils')
const {toUSDTBalances} = require('./helper/balances')

async function tvl(){
    const data = await fetchURL("https://mainnet.analytics.tinyman.org/api/v1/general-statistics/")
    return toUSDTBalances(data.data.total_liquidity_in_usd)
}

module.exports={
    misrepresentedTokens:true,
    algorand:{
        tvl
    }
}