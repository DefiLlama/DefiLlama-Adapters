const config = {
  ethereum: ["0x09eb323dBFECB43fd746c607A9321dACdfB0140F"],
  base: ["0x09eb323dBFECB43fd746c607A9321dACdfB0140F"],
  arbitrum: ["0x09eb323dBFECB43fd746c607A9321dACdfB0140F", "0x7fBfb946cA4ba96559467E84ef41DA6cfE0C9a17"],
  sonic: ["0xa8E4716a1e8Db9dD79f1812AF30e073d3f4Cf191"],
  hyperliquid: ["0x5CD5D7e3A1b604E0EdeDc4A2343b312729e09E3F"],
};

Object.keys(config).forEach((chain) => {
  const factories = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = (await api.multiCall({ abi: "address[]:getActiveFleetCommanders", calls: factories, })).flat();
      return api.erc4626Sum2({ calls: vaults, });
    },
  };
});
