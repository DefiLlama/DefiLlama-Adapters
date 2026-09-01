const { sumTokensExport } = require("../helper/unknownTokens");

const masterchefAddress = "0x7Bd2f7641b875872c7c04ee3B426F753C7093aD5";
const alyxToken = "0x2701C7cBf3220FFF6e6CEaabbCD9B932Eb11E3Ff";
const alyx_bsc_lp = "0xf5Ea0B5AafC6eDACA15909a02C1e16bCaCd74C1e"
const treasury = "0x576182b7a1b0bC67701ead28a087228c50Aa0982";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sumTokensExport({ tokens: [alyx_bsc_lp], owner: treasury, useDefaultCoreAssets: true }),
    pool2: sumTokensExport({ tokens: [alyx_bsc_lp], owner: masterchefAddress, useDefaultCoreAssets: true }),
    staking: sumTokensExport({ tokens: [alyxToken], owner: masterchefAddress, useDefaultCoreAssets: true, lps: [alyx_bsc_lp] }),
  },
  methodology: `Total amount of tokens in treasury and masterchef contract`,
};