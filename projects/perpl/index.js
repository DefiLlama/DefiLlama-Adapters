const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const EXCHANGE = "0x34B6552d57a35a1D042CcAe1951BD1C370112a6F";
const AUSD = ADDRESSES.mantle.AUSD;

module.exports = {
  methodology:
    "TVL is the total AUSD collateral deposited in the Perpl Exchange contract.",
  monad: {
    tvl: sumTokensExport({
      tokensAndOwners: [[AUSD, EXCHANGE]],
    }),
  },
};
