const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const LOCKED_STAKING = "0xd95773e5b1eedc7ff302a70acd0eb370927397d2";
const NONLOCK_STAKING = "0xd9747a98624f0B64B4412632C420672E16432334";
const OFF_STAKING = "0xC9B6c67af496E92F64b1C136B3FaD15e3b02cbb4";
const OFF_TOKEN = "0xD55eDfc79c0d14084260D16f38BdA75e28AbFb6A";

module.exports = {
  blast: {
    tvl: sumTokensExport({ 
      owners: [LOCKED_STAKING, NONLOCK_STAKING, OFF_STAKING], 
      tokens: [ADDRESSES.null, ADDRESSES.blast.USDB, OFF_TOKEN] 
    }),
  },
  methodology: "counts the amount of USDB, ETH, and OFF tokens locked in 3 staking contracts",
};
