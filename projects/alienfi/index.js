const { getUniTVL, staking } = require("../helper/unknownTokens");

const arbiFactory = "0xac9d019B7c8B7a4bbAC64b2Dbf6791ED672ba98B";
const arbiStaking = "0xCf8D01c1a20dabcC025368607020473cCb119F5C";
// const arbiPoolStaking = "0xf0E1cE233Bf3DF4f19F36aD03D98faf52E9fD653";
const arbiAlien = "0x6740Acb82ac5C63A7ad2397ee1faed7c788F5f8c";
const AlienUsdcLP = "0xE145A5710Be68C3C9C50c5288909E813c5e92F4e";

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL consists of pools created by the factory contract",
  arbitrum: {
    tvl: getUniTVL({ factory: arbiFactory,  useDefaultCoreAssets: true, }),
    staking: staking({ tokensAndOwners: [[arbiAlien, arbiStaking]], lps: [AlienUsdcLP] })
  },
};
