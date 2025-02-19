
const {getApiTvl} = require('../helper/historicalApi')
const sdk = require('@defillama/sdk')
const { get } = require('../helper/http')

async function v1(timestamp){
    return getApiTvl(timestamp, async ()=>{
      const r = await get("https://abc.ablesdxd.link/swap/scan/statusinfo")
      return Number(r.data.totalLiquidity)
    }, async()=>{
      const r = await get("https://abc.ablesdxd.link/swap/scan/liquidityall")
      // {liquidity: "0.000000000000000000", time: 1597492800000}
      return r.data.map(d=>({
        date: d.time/1000,
        totalLiquidityUSD: Number(d.liquidity)
      }))
    })
}

async function v2(timestamp){
  return getApiTvl(timestamp, async ()=>{
    const r = await get("https://pabc.ablesdxd.link/swapv2/scan/getStatusInfo")
    return Number(r.data.totalLiquidityUsd)
  }, async()=>{
    const r = await get("https://pabc.ablesdxd.link/swapv2/scan/getAllLiquidityVolume")
    // {liquidity: "0.000000000000000000", time: 1597492800000}
    return r.data.map(d=>({
      date: d.time/1000,
      totalLiquidityUSD: Number(d.liquidity)
    }))
  })
}

module.exports = {
        misrepresentedTokens: true,
    methodology: "We get liquidity from the ablesdxd.link API",
    tron:{
      tvl: sdk.util.sumChainTvls([v1,v2])
    }
}
