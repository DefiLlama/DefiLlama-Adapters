const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x0dd126ca9eaba5a9c55b14dd71787f88594a64d5"], // Treasury/Contract holding reserves
      tokens: [],
      fetchCoValentTokens: true,
    }),
  },
  tron: {
    tvl: sumTokensExport({
      owners: ["TMVCgcoajwicbAXc35FLkzkCNstycGzkv"], // TRON Treasury
      tokens: [],
    }),
  },
  methodology: "TVL is calculated by summing the value of assets held in Turbo USD treasury wallets that back the stablecoin.",
};
