const { sumTokensExport } = require("../helper/unwrapLPs");

// Use this for TVL of LP token?
// https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/bitpif/index.js

// Or this?
// https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/corgiswap.js

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        // [tokenAddress, ownerContractAddress]
        [
          "0xF03387d8d0FF326ab586A58E0ab4121d106147DF", // Unbuttoned AAVE AMPL (ubAAMPL)
          "0x5Ec6f02D0b657E4a56d6020Bc21F19f2Ca13EcA9", // AMPL Geyser
        ],
      ],
      resolveLP: true, // double check if needed
    }),
  },
};
