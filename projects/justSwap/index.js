const axios = require('axios')
const {getApiTvl} = require('../helper/historicalApi')

async function tvl(timestamp){
    return getApiTvl(timestamp, async ()=>{
      const r = await axios.get("https://abc.ablesdxd.link/swap/scan/statusinfo")
      return Number(r.data.data.totalLiquidity)
    }, async()=>{
      const r = await axios.get("https://abc.ablesdxd.link/swap/scan/liquidityall")
      // {liquidity: "0.000000000000000000", time: 1597492800000}
      return r.data.data.map(d=>({
        date: d.time,
        totalLiquidityUSD: Number(d.liquidity)
      }))
    })
}

module.exports = {
    tron:{
      tvl
    }
}