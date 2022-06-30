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
  43114: 'avax',
}

const url = ''

markData = {
    "bridgeTokenList": [
        {
            "chainId": 1,
            "tokenAddress": "",
            "symbol": "USDC",
            "decimals": 6,
            "ypoolContractAddress": "",
            "price": 2.16,
            "balance": "245616176457139196363406",
            "tvl": 50.5,
        },
        {
            "chainId": 1,
            "tokenAddress": "",
            "symbol": "USDT",
            "decimals": 6,
            "ypoolContractAddress": "",
            "price": 0.260124,
            "balance": "53623913481087880337446071",
            "tvl": 60.6,
        },
        {
            "chainId": 56,
            "tokenAddress": "",
            "symbol": "USDC",
            "decimals": 6,
            "ypoolContractAddress": "",
            "price": 2.16,
            "balance": "245616176457139196363406",
            "tvl": 7.005,
        },
        {
            "chainId": 56,
            "tokenAddress": "",
            "symbol": "USDT",
            "decimals": 6,
            "ypoolContractAddress": "",
            "price": 0.260124,
            "balance": "53623913481087880337446071",
            "tvl": 7.003,
        },
    ]
}

function fetchChain(chain) {
  return async () => {
    const { data } = await utils.fetchURL(url)
    // const data = markData
    const tokensInChain = chain === null ? data.bridgeTokenList : data.bridgeTokenList.filter(p => p.chainId === chain)
    let total = 0
    tokensInChain.forEach((item) => {
      const tvl = Number(item.tvl || 0)
      total += tvl
    })
    return total
  }
}
// t = fetchChain(null)
// console.log(t())
const chainTvls = {}
Object.keys(chains).forEach((chain) => {
  const chainName = chains[chain]
  chainTvls[chainName === 'avax' ? 'avalanche' : chainName] = {
    fetch: fetchChain(Number(chain))
  }
})
// Object.values(chainTvls).forEach((f) => console.log(f.fetch()))

// module.exports = {
//   misrepresentedTokens: true,
//   timetravel: false,
//   methodology: 'Added up all the stable coins deposited in different chains',
//   ...chainTvls,
//   fetch: fetchChain(null),
// }