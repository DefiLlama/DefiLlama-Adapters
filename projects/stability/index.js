const abi = {
  "vaultAddresses": "function vaultAddresses() view returns (address[] memory vaultAddress)",
  "strategy": "address:strategy",
  "assetsAmounts": "function assetsAmounts() view returns (address[] memory assets, uint[] memory amounts)"
}

const config = {
  polygon: {
    vaultManager: '0x6008b366058B42792A2497972A3312274DC5e1A8',
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      // Stability Platform Vaults
      // Get all vaults
      const vaults = await api.call({        abi: abi.vaultAddresses,        target: config[chain].vaultManager      });

      // Get strategy addresses
      const strategies = await api.multiCall({ abi: abi.strategy, calls: vaults, })

      // Get all assets amounts managed by strategies
      const assetsAmountsAll = await api.multiCall({ abi: abi.assetsAmounts, calls: strategies, })
      assetsAmountsAll.forEach(([assets, amounts]) => api.add(assets, amounts))
    },
  }
})