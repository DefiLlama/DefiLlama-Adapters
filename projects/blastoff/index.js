const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

const LOCKED_STAKING = "0xd95773e5b1eedc7ff302a70acd0eb370927397d2";
const NONLOCK_STAKING = "0xd9747a98624f0B64B4412632C420672E16432334";

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [LOCKED_STAKING, NONLOCK_STAKING], tokens: [ADDRESSES.null, ADDRESSES.blast.USDB] }),
    staking: staking('0xC9B6c67af496E92F64b1C136B3FaD15e3b02cbb4', '0xD55eDfc79c0d14084260D16f38BdA75e28AbFb6A')
  },
  methodology: "counts the amount of USDB and ETH locked in 2 staking contracts",
};
