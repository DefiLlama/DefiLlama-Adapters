const {fetchURL} = require('./helper/utils')
const {toUSDTBalances} = require('./helper/balances')

async function tvl(){
    const data = await fetchURL("https://app.algodex.com/algodex-backend/tvl.php/")
    return toUSDTBalances(data.data.total_liquidity_in_usd)
}

module.exports={
    misrepresentedTokens:true,
    algodex:{
        tvl
    }
}