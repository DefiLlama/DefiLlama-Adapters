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
      coreAssets: [
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
        '0x55d398326f99059ff775485246999027b3197955', // BUSD
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // BETH
        '0xd32d01a43c869edcd1117c640fbdcfcfd97d9d65', // NMX
      ]
    }),
  },
};