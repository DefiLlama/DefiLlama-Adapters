const config = {
  ethereum: {
    v2: [
      "0xF4761cC51DC4532b064b7E0Bf0883bcA3F84375e", // shiftEUR
      "0x5F70E536190C15E5959DbFeF2F2632E540da74CD", // risexUSDC
    ],
  },
  base: {
    v1: [
      "0xaf69Bf9ea9E0166498c0502aF5B5945980Ed1E0E", // Shift Paradex Liquid Token
      "0x4cE3ec1b7B4FFb33A0B70c64a0560A3F341AA2E1", // Shift Extended Basis USD
    ]
  }, 
  arbitrum: {
    v1: [
      "0x956bdd9C18B786b082fd50C52722d254f0CB6964", // Shift Lighter LLP Wrapper
      "0x6d7C897cD8B402690C07e7263C9f59B3777ae3c2", // Shift GRVT Hybrid Vault
      "0x7174f0bD02664BebDB6Aa79a99fAF949570A10bd", // Shift Hibachi Basis USD
    ]
  }, 
}

module.exports = {
  methodology: 'TVL for v1 vaults is calculated by summing total supply of shares distributed to depositors and multiplied by their share price (comprehensive of profit and loss). v2 vaults are ERC-4626 compliant so they use totalAssets().',
};

Object.keys(config).forEach(chain => {
  const { v1 = [], v2 = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (v1.length) api.add(v1, await api.multiCall({ abi: 'erc20:totalSupply', calls: v1 }))
      if (v2.length) await api.erc4626Sum2({ calls: v2 })
    },
  }
})
