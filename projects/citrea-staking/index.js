const { sumTokensExport } = require("../helper/sumTokens");
const ADDRESSES = require("../helper/coreAssets.json");

const XCTR_CONTRACT = "0x2015F35030A8Ff2C0CA161a865414996F8E80AA4";

module.exports = {
  methodology: "Sum of CTR locked by users in the xCTR (Staked CTR) staking contract on Citrea, which grants governance voting power.",
  citrea: {
    tvl: sumTokensExport({ tokensAndOwners: [[ADDRESSES.citrea.CTR, XCTR_CONTRACT]] }),
  },
};
