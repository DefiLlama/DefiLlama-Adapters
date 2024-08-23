const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  merlin: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        // [tokenAddress, ownerContractAddress]
        ['0x5c46bFF4B38dc1EAE09C5BAc65872a1D8bc87378', '0xb311c4b8091aff30Bb928b17Cc59Ce5D8775b13A'], //merl, stake
        ['0x7b0400231Cddf8a7ACa78D8c0483890cd0c6fFD6', '0x8567bD39b8870990a2cA14Df3102a00A7d72f7E3'], //bitmap, stake 1
        ['0x7b0400231Cddf8a7ACa78D8c0483890cd0c6fFD6', '0xb311c4b8091aff30Bb928b17Cc59Ce5D8775b13A'], //bitmap, stake 2
      ],
    }),
  }
};
