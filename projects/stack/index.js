const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "TVL counts the collateral tokens that are deposited within the respective Stack vault",
};

const config = {
  real: {
    vaultFactory: "0x303C5d72D2d123ac6C36957d167Ca7Cfee3414e7",
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
