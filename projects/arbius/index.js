const { stakings } = require("../helper/staking");

const stakingContracts = [
  "0x3A7e6915f997Cdbc8BFB090051AA22E37Dab345d", // votingEscrow
];
const stakingLpContracts = [
  "",
];

const AIUS = "0x4a24B101728e07A52053c13FB4dB2BcF490CAbc3";
const WETH_AIUS_UNIV2 = "";


module.exports = {
  misrepresentedTokens: false,
  arbitrum: {
      staking: stakings(stakingContracts, AIUS),
      tvl: async() => ({}),
    },
    /* ethereum: {
        pool2: stakings(stakingLpContracts, [WETH_AIUS_UNIV2]),
        tvl: async() => ({})
    }, */
  methodology: "Counts staked $AIUS in the voting escrow contract",
};
