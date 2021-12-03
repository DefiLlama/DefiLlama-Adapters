const sdk = require('@defillama/sdk');
const {chainExports} = require('../helper/exports')
const {usdtAddress} = require('../helper/balances')
const {getApiTvl} = require('../helper/historicalApi');
const { fetchURL } = require('../helper/utils');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

async function ethereum(timestamp, block) {
  const supply = await sdk.api.erc20.totalSupply({
    target: '0x9559Aaa82d9649C7A7b220E7c461d2E74c9a3593',
    block
  })

  return {
    [wethAddress]: supply.output
  }
}

const chainToParams={
  bsc: ["RBNB", "binancecoin"],
  polygon: ["RMATIC", "matic-network"],
  polkadot: ["RDOT", "polkadot"],
  kusama: ["RKSM", "kusama"],
  solana: ["RSOL", "solana"],
  cosmos: ["RATOM", "cosmos"],
}

function getTvlFunction(token, cgId){
  return async timestamp=>{
    const bal = await getApiTvl(timestamp, async()=>{
      const data = await fetchURL(API)
      return Number(data.data.data.currentStake.find(r=>r.rsymbol ===token).stakeAmount)
    }, async()=>{
      const data = await fetchURL(API)
      return data.data.data.historyStake[token].map(p=>({
        date: p.timestamp,
        totalLiquidityUSD: Number(p.stakeAmount)
      }))
    })
    return {
      [cgId]: Number(bal[usdtAddress])/(10**6)
    }
  }
}

const API = "https://partner-api.stafi.io/stafi/v1/partnerapi/rtoken/getstakelist"
function chainTvl(chain){
  const [token, cgId] = chainToParams[chain]
  return getTvlFunction(token, cgId)
}

module.exports = {
  ethereum: {
    tvl: ethereum,
    staking:  getTvlFunction("RFIS", "stafi")
  },
  ...chainExports(chainTvl, Object.keys(chainToParams))
}