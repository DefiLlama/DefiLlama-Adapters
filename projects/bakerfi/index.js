const config = {
  "arbitrum": {
    vaults: ["0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44"]
  },
}

async function getVaultTVL(api, vaults) {
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addGasToken(bals)
}

module.exports = {
  methodology: 'Counts the number of assets that are deployed through the protocol',
}

Object.keys(config).forEach(chain => {
  const { vaults = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => await getVaultTVL(api, vaults),
  }
})
