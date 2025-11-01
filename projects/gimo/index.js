const { staking } = require("../helper/staking");

const st0gAddress = "0x7bBC63D01CA42491c3E084C941c3E86e55951404"; // st0G - Liquid Staking 0G
const stakingAddress = "0xAc06d1Df23a4Fa00981aFAC0f33A5936Bd2135aF"; // Gimo Staking Vault

module.exports = {
  methodology: "TVL counts st0G tokens locked in Gimo's staking vault for liquid staking on 0G Chain.",
  "0g": {
    tvl: () => ({}),
    staking: staking(stakingAddress, st0gAddress, "0g"),
  },
};
