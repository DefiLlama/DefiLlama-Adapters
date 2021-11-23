const axios = require('axios')
const {getApiTvl} = require('../helper/historicalApi')
const { usdtAddress } = require('../helper/balances')

async function tvl(timestamp){
    const balances = await getApiTvl(timestamp, async ()=>{
      const r = (await axios.get("https://abc.ablesdxd.link/scan/collInfo/timeLine")).data.data
      return Number(r[r.length-1].wtrxLocked)/1e12
    }, async()=>{
      const r = await axios.get("https://abc.ablesdxd.link/scan/collInfo/timeLine")
      // {liquidity: "0.000000000000000000", time: 1597492800000}
      return r.data.data.map(d=>({
        date: d.t/1000,
        totalLiquidityUSD: Number(d.wtrxLocked)/1e12
      }))
    });
    return {
      "tron": Number(balances[usdtAddress])
    }
}

module.exports = {
    tron:{
      tvl
    }
}