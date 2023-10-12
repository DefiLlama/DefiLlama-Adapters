const sdk = require("@defillama/sdk");
const swap = require("./swap");
const olalending = require("./olalending");
const fuseStaking = require('./fuse-staking');
const stableswap = require('./stableswap')
const { stakings } = require("../helper/staking");

const VOLT_TOKEN = "0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4".toLowerCase();
const VOLT_BAR = "0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1".toLowerCase();
const VOLT_VOTE_ESCROW = "0xB0a05314Bd77808269e2E1E3D280Bff57Ba85672".toLowerCase()

module.exports = {
  timetravel: true,
  fuse: {
    tvl: sdk.util.sumChainTvls([swap.tvl, olalending.tvl, fuseStaking.tvl, stableswap.tvl]),
    borrowed: olalending.borrowed,
    staking: stakings([VOLT_BAR, VOLT_VOTE_ESCROW], VOLT_TOKEN, 'fuse'),
  },
  hallmarks: [
    [1648684800, "Ola Finance exploit"]
]
};
