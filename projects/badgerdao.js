const { getConfig } = require('./helper/cache')

// module.exports.hallmarks = [['2021-12-02', "Front-end attack"]]

const chains = ["ethereum", "bsc", "arbitrum", "polygon", "fantom"]

chains.forEach(chain => {
  let oChain = chain
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'bsc')
        return {}
      const data = await getConfig(`badgerdao/tvl/${chain}`, `https://api.badger.com/v2/vaults?chain=${oChain}&currency=usd`)
      const calls = data.map(i => i.vaultToken)
      return api.erc4626Sum({ calls, permitFailure: true, })
    }
  }
})