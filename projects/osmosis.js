const utils = require('./helper/utils')
const {getApiTvl} = require('./helper/historicalApi')

function tvl(timestamp){
    return getApiTvl(timestamp, 
    async()=>{
        const data = await utils.fetchURL("https://api-osmosis.imperator.co/liquidity/v1/actual")
        return data.data.value
    },
    async()=>{
        const data = await utils.fetchURL("https://api-osmosis.imperator.co/liquidity/v1/historical/chart")
        return data.data.map(d=>({
            date: Math.round(new Date(d.time).getTime()/1000),
            totalLiquidityUSD: d.value
        }))
    })
}

module.exports = {
    methodology: "Counts the liquidity on all AMM pools. Metrics come from https://info.osmosis.zone/",
    tvl
}