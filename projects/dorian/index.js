const { aaveV2Export } = require("../helper/aave");
const { staking } = require("../helper/staking");
const methodologies = require("../helper/methodologies");

const LPConfiguratorContract = "0x29604bF5D09bcb714D13549f98CC4Bb49c2Ff672";
const StakingContract = "0x3C57d20A70d4D34331d442Cd634B0ccAF6Ad89A4";
const TokenContract = "0x6191F90724cD0aa791B7476e804ae00146618Ab6";

module.exports = {
  core: {
    ...aaveV2Export(LPConfiguratorContract, {
      fromBlock: 15251455,
    }),
    staking: staking(StakingContract, TokenContract),
  },
};

module.exports.methodology = methodologies.lendingMarket;
