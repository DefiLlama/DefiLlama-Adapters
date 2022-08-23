const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const factory = "0xd6715A8be3944ec72738F0BFDC739d48C3c29349";

const NMX = "0xd32d01a43c869edcd1117c640fbdcfcfd97d9d65"

const stakingPools = [
  // Staking pool
  "0xdbf1b10fe3e05397cd454163f6f1ed0c1181c3b3",
]

module.exports = {
  bsc: {
    staking: stakings(stakingPools, NMX, 'bsc'),
    tvl: getUniTVL({
      factory,
      chain: 'bsc',
      useDefaultCoreAssets: true,
    }),
  },
};