const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: { masterchef: '0xc570c434ba30a2fa5c07e590833246e18aa6b0a3',},
  polygon: { masterchef: '0xa80d0a371f4d37afcc55188233bb4ad463af9e48',},
  bsc: { masterchef: '0xd978eb90eb1b11213e320f4e6e910eb98d8df1e4',},
  arbitrum: { masterchef: '0xa80d0a371f4d37afcc55188233bb4ad463af9e48',},
  optimism: { masterchef: '0xa80d0a371f4d37afcc55188233bb4ad463af9e48',},
}

Object.keys(config).forEach(chain => {
  const { masterchef } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await api.fetchList({  lengthAbi: 'uint256:getNumberOfVaults', itemAbi: 'function hatVaults(uint256) view returns (address)', target: masterchef})
      const tokens = await api.multiCall({  abi: 'address:asset', calls: vaults})
      const tokensAndOwners = []
      tokens.forEach((token, i) => {
        tokensAndOwners.push([token, vaults[i]])
        tokensAndOwners.push([token, masterchef])
      })
      return sumTokens2({ api, tokensAndOwners,})
    }
  }
})