const config = {
  ethereum: [
    "0xf7de3c70f2db39a188a81052d2f3c8e3e217822a"
  ],
};

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const bals = await api.multiCall({ abi: 'function totalAssets() external view returns(uint256)', calls: config[chain], permitFailure: true });
      const assets = await api.multiCall({ abi: 'function asset() external view returns(address)', calls: config[chain], permitFailure: true });
      bals.forEach((bal, i) => {
        if (bal) api.add(assets[i], bal)
      })
    },
  };
});
