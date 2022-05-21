const utils = require('../helper/utils')
// const sdk = require("@defillama/sdk")
// console.log(sdk)

const chains = {
  '1': 'ethereum', 
  '10': 'optimism',
  '25': 'cronos',  
  '30': 'rsk',     
  '40': 'telos',   
  '56': 'bsc',     
  '57': 'syscoin',
  '61': 'ethereumclassic',
  '66': 'okexchain',
  '100': 'xdai',
  '106': 'velas',
  '122': 'fuse',
  '128': 'heco',
  '137': 'polygon',
  '199': 'bittorrent',
  '250': 'fantom',
  '288': 'boba',
  '321': 'kcc',
  '336': 'shiden',
  '592': 'astar',
  '1030': 'conflux',
  '1088': 'metis',
  '1284': 'moonbeam',
  '1285': 'moonriver',
  '2001': 'milkomeda',
  '2020': 'ronin',
  '4689': 'iotex',
  '9001': 'evmos',
  '32659': 'fusion',
  '42161': 'arbitrum',
  '42220': 'celo',
  '42262': 'oasis',
  '43114': 'avax',
  '53935': 'dfk',
  '1313161554': 'aurora',
  '1666600000': 'harmony'
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