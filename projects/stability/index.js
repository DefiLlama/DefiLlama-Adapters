const abi = {
  "vaultAddresses": "function vaultAddresses() view returns (address[] memory vaultAddress)",
  "strategy": "address:strategy",
  "assetsAmounts": "function assetsAmounts() view returns (address[] memory assets, uint[] memory amounts)"
}

const config = {
  polygon: {
    vaultManager: '0x6008b366058B42792A2497972A3312274DC5e1A8',
  },
  base: {
    vaultManager: '0x2ba8C6A519CEDB6d1C35cEb14E8642625E91F77C',
  },
  real: {
    vaultManager: '0x7146efaab12A083b9826c66162062c21eC70fe3c',
  },
  sonic: {
    vaultManager: '0x589a504f2ee9d054b483c700fa814863d639381e',
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