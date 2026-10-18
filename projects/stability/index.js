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
    // vaults lending USDC into insolvent Silo markets (0 liquidity, unwithdrawable); their claim compounds as phantom interest
    blacklistedVaults: [
      '0x8913582701B7c80E883F9E352c1653a16769B173', // C-USDC-S1 -> Silo xUSD/USDC (Stream-impacted)
      '0xd248c4b6Ec709FEeD32851A9F883AfeaC294aD30', // C-USDC.e-S3 -> Silo PT-wstkscUSD-29MAY2025/USDC
    ],
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      // Stability Platform Vaults
      // Get all vaults
      const blacklist = new Set((config[chain].blacklistedVaults ?? []).map(v => v.toLowerCase()))
      const vaults = (await api.call({        abi: abi.vaultAddresses,        target: config[chain].vaultManager      })).filter(v => !blacklist.has(v.toLowerCase()));

      // Get strategy addresses
      const strategies = await api.multiCall({ abi: abi.strategy, calls: vaults, })

      // Get all assets amounts managed by strategies
      const assetsAmountsAll = await api.multiCall({ abi: abi.assetsAmounts, calls: strategies, })
      assetsAmountsAll.forEach(([assets, amounts]) => api.add(assets, amounts))
    },
  }
})