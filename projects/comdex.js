const utils = require('./helper/utils')
const {getApiTvl} = require('./helper/historicalApi')

function tvl(timestamp){
    return getApiTvl(timestamp, 
    async()=>{
        const data = await utils.fetchURL("https://api-comdex.zenchainlabs.io/staking/pool")
        bonded = data.data.result.bonded_tokens
        return bonded / Math.pow(10,6)
    },
    async()=>{
        const data = await utils.fetchURL("https://api-osmosis.imperator.co/tokens/v1/liquidity/CMDX/chart")
        return data.data.map(d=>({
            date: Math.round(new Date(d.time).getTime()/1000),
            totalLiquidityUSD: d.value
        }))
    })
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "Counts the liquidity on all AMM pools. Metrics come from https://info.osmosis.zone/",
    tvl
}