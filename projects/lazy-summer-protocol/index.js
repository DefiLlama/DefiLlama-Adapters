const config = {
  ethereum: "0x09eb323dBFECB43fd746c607A9321dACdfB0140F",
  base: "0x09eb323dBFECB43fd746c607A9321dACdfB0140F",
  arbitrum: "0x09eb323dBFECB43fd746c607A9321dACdfB0140F",
  sonic: "0xa8E4716a1e8Db9dD79f1812AF30e073d3f4Cf191",
  hyperliquid: "0x5CD5D7e3A1b604E0EdeDc4A2343b312729e09E3F",
};

Object.keys(config).forEach((chain) => {
  const harborCommand = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await api.call({
        abi: "address[]:getActiveFleetCommanders",
        target: harborCommand,
      });
      const assets = await api.multiCall({
        abi: "address:asset",
        calls: vaults,
      });
      const balances = await api.multiCall({
        abi: "uint256:totalAssets",
        calls: vaults,
      });
      api.add(assets, balances);
    },
  };
});
