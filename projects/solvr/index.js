const { staking } = require("../helper/staking");

module.exports = {
  base: {
    tvl: () => ({}),
    staking: staking(
      "0xde2dc52d8ac7b793a9558b7b13b7b24f5c3b983a",
      "0x6DfB7BFA06e7c2B6c20C22c0afb44852C201eB07"
    ),
  },
  methodology: "TVL is calculated as the total SOLVR tokens staked in the SolvrStaking contract on Base.",
};
