const utils = require('../helper/utils')

const chains = {
  1: 'ethereum',
  56: 'bsc',
  66: 'okexchain',
  100: 'xdai',
  128: 'heco',
  137: 'polygon',
  250: 'fantom',
  321: 'kcc',
  1285: 'moonriver',
  42161: 'arbitrum',
  43114: 'avax',
  1666600000: 'harmony',
}


const url = 'https://netapi.anyswap.net/bridge/v2/info'

async function tvl(){
  const {data} = await utils.fetchURL(url)
  let totaltvl = 0
  data.bridgeList.forEach((item) => {
    const chainId = item.chainId
    const tvl = item.tvl ? item.tvl : 0
    if (chainId && chains[chainId]) {
      totaltvl += Number(tvl)
    }
  })
  
  return totaltvl
}

const chainTvls = {}
Object.keys(chains).forEach((chain) => {
  const key = chains[chain]
  chainTvls[key]={
    tvl: async()=>{
      const {data} = await utils.fetchURL(url)
      const balances = {}
      data.bridgeList.forEach((item) => {
        const chainId = item.chainId
        const tvl = item.tvl ? item.tvl : 0
        if (chainId.toString() === chain.toString()) {
          if (!balances[key]) {
            balances[key] = {
              tvl: 0
            }
          }
          balances[key].tvl += Number(tvl)
        }
      })
      return balances[key].tvl
    }
  }
})

module.exports = {
  ...chainTvls,
  tvl
}