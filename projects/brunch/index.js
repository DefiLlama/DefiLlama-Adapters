const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "TVL counts the collateral tokens that are deposited within the respective Brunch vault",
};

const config = {
  sonic: {
    vaultFactory: "0x486265E7BAedFF677aec98f7769Cf737657E009a",
  },
};

Object.keys(config).forEach((chain) => {
  const { vaultFactory } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await api.fetchList({ lengthAbi: 'allVaultsLength', itemAbi: 'allVaults', target: vaultFactory })
      const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: vaults })
      return sumTokens2({ tokensAndOwners2: [tokens, vaults], api })
    }
  }
})
