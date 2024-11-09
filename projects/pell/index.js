const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chains = ['ethereum', 'arbitrum', 'merlin', 'bouncebit', 'btr', 'bsc', 'base', 'bsquared', 'core', 'bevm', 'mantle', 'scroll', 'bob', 'ailayer', 'iotex', 'rsk']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      const { result } = await getConfig(`pell/${api.chain}`, `https://api.pell.network/v1/stakeList?chainId=${api.chain === 'bsquared' ? 223 : api.chainId}`)
      const vaults = result.map(f => f.strategyAddress)
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], })
    }
  }
})
