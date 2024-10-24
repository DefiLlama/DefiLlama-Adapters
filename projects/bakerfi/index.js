const config = {
  "arbitrum": {
    vaults: ["0x4c6d58749126FEBb1D28E8B8FdE97DC3107996d3"]
  },
  base: {
    vaults: ["0x37327c99bBc522e677a97d01021dB20227faF60A"]
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
