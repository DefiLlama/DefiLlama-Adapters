const utils = require('./helper/utils')
const {getApiTvl} = require('./helper/historicalApi')

function tvl(timestamp){
    return getApiTvl(timestamp,
    async()=>{
        const data = await utils.fetchURL("https://apigw-v2.crescent.network/stat/tvl")
        return data.data.data[0].tvl
    },
    async()=>{
        const data = await utils.fetchURL("https://apigw-v2.crescent.network/stat/tvl")
        return data.data.data.map(d=>({
            date: Math.round(new Date(d.date).getTime()/1000),
            totalLiquidityUSD: d.tvl
        }))
    })
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "Counts the liquidity on all pools. ",
    crescent: {
        tvl
    }
} // node test.js projects/crescent.js
