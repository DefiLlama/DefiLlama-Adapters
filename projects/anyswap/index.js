const utils = require('../helper/utils')

const chains = {
  250: 'fantom',
  1: 'ethereum',
  40: 'telos',
  56: 'bsc',
  57: 'syscoin',
  66: 'okexchain',
  100: 'xdai',
  128: 'heco',
  137: 'polygon',
  321: 'kcc',
  1285: 'moonriver',
  42161: 'arbitrum',
  43114: 'avax',
  1666600000: 'harmony',
  2001: 'milkomeda'
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