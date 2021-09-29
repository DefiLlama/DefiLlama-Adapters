const {getApiTvl} = require('../helper/historicalApi')
const {fetchURL} = require('../helper/utils')

const endpoint = "http://51.158.191.108:8002/api/v1/history/neutrino"
const MINUTE = 60*1000

async function tvl(time){
    return getApiTvl(time, async()=>{
        const data = (await fetchURL(`${endpoint}?limit=1000&since=${time*1e3-10*MINUTE}`)).data
        const last = data[data.length-1]
        return last.usdnLocked + last.defoLocked
    }, async()=>{
        const data = (await fetchURL(`${endpoint}?limit=1000&since=${time*1e3-6*60*MINUTE}`)).data
        return data.map(item=>({
            date: item.createdAt/1e3,
            totalLiquidityUSD: item.usdnLocked + item.defoLocked
        }))
    })
}

module.exports={
    tvl
}