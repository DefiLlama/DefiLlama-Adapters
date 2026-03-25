const { sumTokensExport } = require("../helper/unwrapLPs");

const EXCHANGE = "0x34B6552d57a35a1D042CcAe1951BD1C370112a6F";
const AUSD = "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a";

module.exports = {
  methodology:
    "TVL is the total AUSD collateral deposited in the Perpl Exchange contract.",
  monad: {
    tvl: sumTokensExport({
      tokensAndOwners: [[AUSD, EXCHANGE]],
    }),
  },
};
