const config = {
  "arbitrum": {
    vaults: ["0x4c6d58749126FEBb1D28E8B8FdE97DC3107996d3"]
  },
  base: {
    vaults: ["0x37327c99bBc522e677a97d01021dB20227faF60A", "0x892022FE1431fdE03836725BBD0f0380e21E2095", "0x4BA3f77a8072217dabd7FeD28DB244A5d32C572E"]
  },
  ethereum: {
    vaults: ["0x01280b3683fE20Dc9cCF4D9526418F252871E4F7", "0x909d587c482766814B368d5b136d98819B9373d7"]
  },
}

async function getVaultTVL(api, vaults) {
  const bals = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: vaults,
  });
  api.addGasToken(bals);
}

module.exports = {
  methodology:
    "Counts the number of assets that are deployed through the protocol",
};

Object.keys(config).forEach((chain) => {
  const { vaults = [] } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => await getVaultTVL(api, vaults),
  };
});
