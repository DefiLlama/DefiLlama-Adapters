const utils = require('./helper/utils')
const {getApiTvl} = require('./helper/historicalApi')

function tvl(timestamp){
    return getApiTvl(timestamp, 
    async()=>{
        const data = await utils.fetchURL("https://api-osmosis.imperator.co/liquidity/v2/historical/chart")
        return data.data.pop().value
    },
    async()=>{
        const data = await utils.fetchURL("https://api-osmosis.imperator.co/liquidity/v2/historical/chart")
        return data.data.map(d=>({
            date: Math.round(new Date(d.time).getTime()/1000),
            totalLiquidityUSD: d.value
        }))
    })
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "Counts the liquidity on all AMM pools. Metrics come from https://info.osmosis.zone/",
    osmosis: {
        tvl
    }
} // node test.js projects/osmosis.js