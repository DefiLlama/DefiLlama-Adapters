const { compoundExports } = require("../helper/compound");

const comptroller = "0x9f750cf10034f3d7a18221aec0bddab7fc6f32ba";
const cether = "0x685d1f1a83ff64e75fe882e7818e4ad9173342ca";
const cetheEquivalent = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
const blacklistedTokens = ["0x6e002cb9bf8c17409eeb6c593ef6548faddd2985"];

module.exports = {
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets.",
  arbitrum: compoundExports(
    comptroller,
    'arbitrum',
    cether,
    cetheEquivalent,
    undefined,
    undefined,
    { blacklistedTokens: blacklistedTokens }
  ),
};
