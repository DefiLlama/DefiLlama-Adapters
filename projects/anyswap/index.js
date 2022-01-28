const utils = require('../helper/utils')
// const sdk = require("@defillama/sdk")
// console.log(sdk)

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
  42220: 'celo',
  4689: 'iotex',
  336: 'shiden',
  122: 'fuse',
  32659: 'fusion',
  1313161554: 'aurora',
  288: 'boba',
  25: 'cronos',
  40: 'telos',
  1284: 'moonbeam',
  1088: 'metis',

  30: 'rsk',
  88: 'tomochain',
  888: 'wan',
  108: 'thundercore',
  10: 'optimism',
  11297108109: 'palm',
  246: 'energyweb',
  19: 'songbird',
  269: 'hpb',
  60: 'gochain',
  61: 'ethclassic',
  200: 'xdaiarb',
  0: 'kardia',
  10000: 'smartbch',
  20: 'elastos',
  70: 'hoo',
  2020: 'ronin',
  333999: 'polis',
  55: 'zyx',
  8: 'ubiq',
  106: 'velas',
  820: 'callisto',
  8217: 'klaytn',
  52: 'csc',
  5551: 'nahmii',
  5050: 'liquidchain',
  82: 'meter',
  361: 'theta',
  42262: 'oasis',
  57: 'syscoin',
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
      return balances[key] && balances[key].tvl ? balances[key].tvl : undefined
    }
  }
})

module.exports = {
  ...chainTvls,
  tvl
}