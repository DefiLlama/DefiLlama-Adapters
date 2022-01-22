const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");


async function staking(){
    const tvl = await fetchURL("https://4tnn0ogfdi.execute-api.us-east-1.amazonaws.com/prod/analytics")
    if(tvl.data.tokenVaults.totalValueLocked<=0){
        throw new Error("vyfi tvl is below 0")
    }
    return toUSDTBalances(tvl.data.tokenVaults.totalValueLocked)
}

module.exports={
    misrepresentedTokens: true,
    timetravel: false,
    cardano:{
        tvl: ()=>({}),
        staking
    }
}