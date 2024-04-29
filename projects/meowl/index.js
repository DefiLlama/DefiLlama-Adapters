const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const MEOWL = "0x1f1f26c966f483997728bed0f9814938b2b5e294";
const stakingContract = "0x679a376dab6318d62de3c87292e207532c8607a9";

module.exports = {
    methodology: `TVL for MEOWL consists of the staking of MEOWL tokens`,
    ethereum: {
        tvl: () => ({}),
        staking: staking([stakingContract, '0x1e8ba7064e31bb3E9C041C2c2825833f499C2046'], [MEOWL, '0x556bB0B27E855e6f2cEBb47174495B9BBEB97fF1']),
    }
}