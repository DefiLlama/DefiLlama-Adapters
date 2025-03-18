const config = {
  ethereum: [
    "0x7fF67093231CE8DBC70c0A65b629ed080e66a7F0", // pumpbtc
    "0xe5DfcE87E75e92C61aeD31329716Cf3D85Cd9C8c"  // ylBTCLST
  ],
};

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      return api.erc4626Sum({ calls: config[chain], isOG4626: true, permitFailure:true });
    },
  };
});

