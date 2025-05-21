const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chains = ['ethereum', 'arbitrum', 'merlin', 'bouncebit', 'btr', 'bsc', 'base', 'bsquared', 'core', 'bevm', 'mantle', 'scroll', 'bob', 'ailayer', 'iotex', 'rsk', 'zeta', 'hemi', 'bouncebit']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      if (api.chain === 'bevm') api.chainId = 11501
      if (api.chain === 'hemi') api.chainId = 43111
      if (!api.chainId) throw new Error('chainId is required, missing in ' + api.chain)
      const { result } = await getConfig(`pell/${api.chain}-v1`, `https://api.pell.network/v1/stakeList?chainId=${api.chainId}`)
      const vaults = result.map(f => f.strategyAddress)
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], })
    }
  }
})
