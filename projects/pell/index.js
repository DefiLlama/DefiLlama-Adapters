const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chains = ['ethereum', 'arbitrum', 'merlin', 'bouncebit', 'btr', 'bsc', 'base', 'bsquared', 'core', 'bevm', 'mantle', 'scroll', 'bob', 'ailayer', 'iotex', 'rsk', 'zeta', 'corn', 'hemi', 'era', 'bouncebit']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      if (api.chain === 'corn') {
        api.chainId = 21000000
      }
      if (api.chain === 'hemi') {
        api.chainId = 43111
      }
      const { result } = await getConfig(`pell/${api.chain}`, `https://api.pell.network/v1/stakeList?chainId=${api.chainId}`)
      const vaults = result.map(f => f.strategyAddress)
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], })
    }
  }
})
