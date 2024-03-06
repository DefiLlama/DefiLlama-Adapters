const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const LOCKED_STAKING = "0xd95773e5b1eedc7ff302a70acd0eb370927397d2";
const NONLOCK_STAKING = "0xd9747a98624f0B64B4412632C420672E16432334";

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [LOCKED_STAKING, NONLOCK_STAKING], tokens: [ADDRESSES.null, ADDRESSES.blast.USDB] }),
  },
  methodology: "counts the amount of USDB and ETH locked in 2 staking contracts",
};
