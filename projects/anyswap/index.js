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

function fetchChain(chain) {
  return async () => {
    const { data } = await utils.fetchURL(url)
    const protocolsInChain = chain === null ? data.bridgeList : data.bridgeList.filter(p => p.chainId.toString() === chain.toString())
    const protocolsWithRouters = protocolsInChain.filter(p => p.type === "router");

    const coingeckoMcaps = {}
    for(let i=0; i<protocolsWithRouters.length; i+=50){
      const cgUrl = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&include_market_cap=true&ids=${
        protocolsWithRouters.slice(i, i+50).map(p => p.label.toLowerCase()).join(',')
      }`
      const partMcaps = await utils.fetchURL(cgUrl)
      Object.assign(coingeckoMcaps, partMcaps.data)
    }

    const counted = {}
    let total = 0
    protocolsInChain.forEach((item) => {
      const tvl = Number(item.tvl || 0)

      if (item.type === "bridge") {
        total += tvl
      } else if (item.type === "router") {
        const label = item.label
        const mcap = coingeckoMcaps[label]?.usd_market_cap
        if(counted[label]===undefined){
          counted[label] = 0
        }
        if (mcap !== undefined && mcap>counted[label]) {
          const tvlToAdd = Math.min(tvl, mcap-counted[label])
          total += tvlToAdd
          counted[label] += tvlToAdd
        }
      }
    })
    return total
  }
}


const chainTvls = {}
Object.keys(chains).forEach((chain) => {
  const chainName = chains[chain]
  chainTvls[chainName === 'avax' ? 'avalanche' : chainName] = {
    fetch: fetchChain(chain)
  }
})

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ...chainTvls,
  fetch: fetchChain(null),
}