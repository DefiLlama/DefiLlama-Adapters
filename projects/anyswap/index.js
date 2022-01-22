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
}

const url = 'https://netapi.anyswap.net/bridge/v2/info'

function fetchChain(chain) {
  return async () => {
    const { data } = await utils.fetchURL(url)
    const protocolsInChain = chain === null ? data.bridgeList : data.bridgeList.filter(p => p.chainId.toString() === chain.toString())
    const protocolsWithRouters = protocolsInChain.filter(p => p.type === "router");

    const coingeckoMcaps = await utils.fetchURL(
      `https://api.coingecko.com/api/v3/simple/price?ids=${protocolsWithRouters.map(p => p.label.toLowerCase()).join(',')
      }&vs_currencies=usd&include_market_cap=true`
    )

    const counted = {}
    let total = 0
    protocolsInChain.forEach((item) => {
      const tvl = item.tvl || 0

      if (item.type === "bridge") {
        total += Number(tvl)
      } else if (item.type === "router") {
        const label = item.label
        const mcap = coingeckoMcaps.data[label]?.usd_market_cap //coingeckoMcaps.data[item.token.toLowerCase()]?.usd_market_cap
        if (mcap !== undefined && (counted[label]===undefined || counted[label]<mcap)) {
          total += Math.min(Number(tvl), mcap)
          counted[label]=(counted[label] || 0) + tvl
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