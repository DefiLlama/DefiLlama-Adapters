const {getApiTvl} = require('../helper/historicalApi')
const {fetchURL} = require('../helper/utils')

const MINUTE = 60*1000

function wavesAdapter(endpoint, calcTvl){
    return async (time) => {
        return getApiTvl(time, async()=>{
            const data = (await fetchURL(`${endpoint}?limit=1000&since=${time*1e3-10*MINUTE}`)).data
            const last = data[data.length-1]
            return calcTvl(last)
        }, async()=>{
            const data = (await fetchURL(`${endpoint}?limit=1000&since=${time*1e3-6*60*MINUTE}`)).data
            return data.map(item=>({
                date: item.createdAt/1e3,
                totalLiquidityUSD: calcTvl(item)
            }))
        })
    }
}

module.exports={
    wavesAdapter
}