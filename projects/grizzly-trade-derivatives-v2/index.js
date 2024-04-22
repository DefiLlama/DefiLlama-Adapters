const config = {
  bsc: "0x350593457926b11BC9923f16FA06C1b7D10f4b56",
};

Object.keys(config).forEach((chain) => {
  const target = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: "address[]:getAssetList", target });
      return api.sumTokens({ owner: target, tokens });
    },
  };
});
