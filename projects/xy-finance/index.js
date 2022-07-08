const utils = require('../helper/utils')

const chains = {
  1: 'ethereum',
  10: 'optimism',
  25: 'cronos',
  56: 'bsc',
  108: 'thundercore',
  137: 'polygon',
  250: 'fantom',
  321: 'kcc',
  592: 'astar',
  1285: 'moonriver',
  42161: 'arbitrum',
  43114: 'avalanche',
}

const url = 'https://api.xy.finance/stats/v1/tvl'

function fetchChain(chain) {
  return async () => {
    let req_url = chain === null ? url : url + '?chainId=' + chain
    const { data } = await utils.fetchURL(req_url)
    const tokensInChain = chain === null ? data.bridgeTokenList : data.bridgeTokenList.filter(p => p.chainId === chain)
    let total = 0
    tokensInChain.forEach((item) => {
      const tvl = Number(item.tvl || 0)
      total += tvl
    })
    return total
  }
}

const chainTvls = {}
Object.keys(chains).forEach((chain) => {
  const chainName = chains[chain]
  chainTvls[chainName] = {
    fetch: fetchChain(Number(chain))
  }
})

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'Added up all the stable coins deposited in different chains',
  ...chainTvls,
  fetch: fetchChain(null),
}