const { compoundExports } = require("../helper/compound");

const comptroller = "0x9F750CF10034f3d7a18221aEc0BdDab7fC6F32bA";
const chain = "arbitrum";
const cether = "0x685D1F1A83fF64e75FE882e7818E4aD9173342Ca";
const cetheEquivalent = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
const transformAdressRaw = null;
const checkForLPTokens = undefined;
const lastParam = {
  blacklistedTokens: [],
  fetchBalances: false,
};

module.exports = {
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets.",
  arbitrum: compoundExports(
    comptroller,
    chain,
    cether,
    cetheEquivalent,
    transformAdressRaw,
    checkForLPTokens,
    lastParam
  ),
};
