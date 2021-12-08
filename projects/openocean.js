const { toUSDTBalances } = require('./helper/balances')
const utils = require('./helper/utils')

const api = "http://market-api.openocean.finance/v2/market"

function getPartTvl(chain, name){
    return async ()=>{
        const data = await utils.fetchURL(api)
        return toUSDTBalances(data.data[chain].find(d=>d.name === name).value)
    }
}

module.exports={
    bsc:{
        tvl: getPartTvl("bsc", "tvl"),
        pool2: getPartTvl("bsc", "pool2"),
        staking: getPartTvl("bsc", "staking")
    },
    avalanche:{
        tvl: getPartTvl("avax", "tvl"),
        staking: getPartTvl("avax", "staking")
    },
    ethereum:{
        tvl: getPartTvl("eth", "tvl"),
        staking: getPartTvl("eth", "staking")
    }
}