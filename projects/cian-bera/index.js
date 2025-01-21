const config = {
  ethereum: [
    "0x6dD1736E15857eE65889927f40CE3cbde3c59Cb2", // rseth
    "0x83B5ab43b246F7afDf465103eb1034c8dfAf36f2", // pumpbtc
    "0xf7cb66145c5Fbc198cD4E43413b61786fb12dF95", // unibtc
    "0x699f698Ad986075734167A875997e1a367C01a8d", // cbbtc
    "0xC8C3ABB76905caD1771448B5520F052FE83e8B0E", // wbeth
    "0xEFe4c96820F24c4BC6b2D621fD5FEb2B46adC1Df", // usda
    "0xe4794e30AA190baAA953D053fC74b5e50b3575d7", // susda
    "0x0186b03AC7C14a90d04D2b1e168869F618D149c5", // ylpumpbtc
    "0x16c6B81Eb1B148326dc6D0bFCE472f68F3518187", // ylunibtc
    "0x8073588bdfe8DBf0375e57425A29E8dC4003C3E6", // ylrseth
    "0x0A9Ea3a5A26ac80535046F0Fd004523CF5c03bb5", // wsteth
    "0xc71FB1bC07a65375121cdea87AD401207dD745b8"  // ylBTCLST
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

