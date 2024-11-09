const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0x11cdC9Bd86fF68b6A6152037342bAe0c3a717f56";
const maki = "0x5FaD6fBBA4BbA686bA9B8052Cf0bd51699f38B93";
const makiChef = "0x4cb4c9C8cC67B171Ce86eB947cf558AFDBcAB17E";

module.exports = {
  misrepresentedTokens: true,
  heco: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, abis: { allPairsLength: 'uint256:totalPairs'}}),
    staking: staking(makiChef, maki),
  },
}