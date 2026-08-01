const { getConfig } = require('../helper/cache')
const { sumUnknownTokens } = require('../helper/unknownTokens')

const config = {
  shimmer_evm: 'shimmer'
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const chainKey = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig('potluck-protocol', 'https://newapi.potluckprotocol.com/vaults')
      const vaults = data.filter(i => i.chain === chainKey).map(i => i.earnedTokenAddress)
      const tokens = await api.multiCall({ calls: vaults, abi: 'address:want'})
      const bals = await api.multiCall({ calls: vaults, abi: 'uint256:balance'})
      api.addTokens(tokens, bals)
      return sumUnknownTokens({ api, resolveLP: true,  useDefaultCoreAssets: true, lps: tokens, })
    }
  }
})
