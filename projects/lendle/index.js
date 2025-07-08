const { aaveV2Export } = require("../helper/aave");
const { staking } = require("../helper/staking");

const LPConfiguratorContract = "0x30D990834539E1CE8Be816631b73a534e5044856";
const StakingContract = "0x5C75A733656c3E42E44AFFf1aCa1913611F49230";
const TokenContract = "0x25356aeca4210eF7553140edb9b8026089E49396";

module.exports = {
  mantle: {
    ...aaveV2Export(LPConfiguratorContract, {
      fromBlock: 56556,
    }),
    staking: staking(StakingContract, TokenContract),
  },
};
