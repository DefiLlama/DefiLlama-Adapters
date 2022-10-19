const sdk = require("@defillama/sdk");
const swap = require("./swap");
const olalending = require("./olalending");
const { stakingPricedLP } = require("../helper/staking");

const VOLT_TOKEN = "0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4".toLowerCase();
const VOLT_BAR = "0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1".toLowerCase();
const WFUSE_VOLT_LP =
  "0xa670b12f8485aa379e99cf097017785b6aca5968".toLowerCase();

module.exports = {
  timetravel: true,
  fuse: {
    tvl: sdk.util.sumChainTvls([swap.tvl, olalending.tvl]),
    borrowed: olalending.borrowed,
    staking: stakingPricedLP(
      VOLT_BAR,
      VOLT_TOKEN,
      "fuse",
      WFUSE_VOLT_LP,
      "fuse-network-token"
    ),
  },
  hallmarks: [
    [1648684800, "Ola Finance exploit"]
]
};
