const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");
const contract = "0x0e22B5f3E11944578b37ED04F5312Dfc246f443C";

module.exports = {
  methodology: "We counts tvl and staking from the main diamond contract",
  misrepresentedTokens: false,
  base: {
    tvl: sumTokensExport({ owners: [contract], tokens: [coreAssets.null] }),
    staking: staking(contract, "0xFF0C532FDB8Cd566Ae169C1CB157ff2Bdc83E105"),
  },
};
