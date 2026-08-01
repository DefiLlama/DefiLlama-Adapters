const config = {
  arbitrum: {
    pools: [
      "0x501B03BdB431154b8Df17BF1c00756E3a8F21744", // WETHUSDC
      "0x550e7E236912DaA302F7d5D0d6e5D7b6EF191f04", // WBTCUSDC
      "0x4eed3A2b797Bf5630517EcCe2e31C1438A76bb92", // ARBUSDC
    ],
  },
}

Object.keys(config).forEach(chain => {
  const { pools } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const callAssets = await api.multiCall({ abi: 'address:callAsset', calls: pools })
      const putAssets = await api.multiCall({ abi: 'address:putAsset', calls: pools })

      return api.sumTokens({ tokensAndOwners2: [callAssets.concat(putAssets), pools.concat(pools)]})
    }
  }
})