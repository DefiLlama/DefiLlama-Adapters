const utils = require('../helper/utils')

const chains = {
  1: 'ethereum',
  10: 'optimism',
  30: 'rsk',
  56: 'bsc',
  66: 'okexchain',
  80: 'tomochain',
  100: 'xdai',
  108: 'thundercore',
  128: 'heco',
  137: 'polygon',
  250: 'fantom',
  321: 'kcc',
  888: 'wan',
  1285: 'moonriver',
  4689: 'iotex',
  42161: 'arbitrum',
  42220: 'celo',
  43114: 'avax',
  1666600000: 'harmony',
  11297108109: 'palm',
}

const url = 'https://netapi.anyswap.net/bridge/v2/info'

async function tvl(){
  const {data} = await utils.fetchURL(url)
  const balances = {}
  data.bridgeList.forEach((item) => {
    const chainId = item.chainId
    const tvl = item.tvl ? item.tvl : 0
    if (chainId && chains[chainId]) {
      if (!balances[chains[chainId]]) {
        balances[chains[chainId]] = {
          tvl: 0
        }
      }
      balances[chains[chainId]].tvl += Number(tvl)
    }
  })
  
  const tvl = {}
  let totaltvl = 0

  Object.keys(balances).forEach((value) => {
    totaltvl += balances[value].tvl
    tvl[value] = {
      tvl: async()=>{
        return balances[value].tvl
      }
    }
  })

  return {
    ...tvl,
    tvl: async()=>{
      return totaltvl
    }
  }
}

module.exports = {
  ...tvl
}