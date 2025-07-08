const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require("../helper/staking");

const stakingContract = "0x9154c2684aeF8d106babcB19Aa81d4FabF7581ec";
const BURGER = "0xae9269f27437f0fcbc232d39ec814844a51d6b8f";
const factory = "0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: staking(stakingContract, BURGER),
  },
  methodology:
    "TVL is equal to AMMs liquidity plus the Assets deposited on Burger Shack",
};
