const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chains = ['bsc']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      const { result } = await getConfig(`binlayer/${api.chain}`, `https://api.binlayer.xyz/v1/stakeList?chainId=${api.chainId}`)
      const vaults = result.map(f => f.strategyAddress)
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], })
    }
  }
})
