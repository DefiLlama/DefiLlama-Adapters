const { getConfig } = require('./helper/cache')

// module.exports.hallmarks = [[1638403200, "Front-end attack"]]

const chains = ["ethereum", "bsc", "arbitrum", "polygon", "fantom"]

chains.forEach(chain => {
  let oChain = chain
  if (chain === 'bsc')
  oChain = 'binance-smart-chain'
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig(`badgerdao/tvl/${chain}`, `https://api.badger.com/v2/vaults?chain=${oChain}&currency=usd`)
      if (!data || Object.keys(data).length === 0) return;
      const calls = data.map(i => i.vaultToken)
      return api.erc4626Sum({ calls, permitFailure: true, })
    }
  }
})