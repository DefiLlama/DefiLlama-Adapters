const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7"

module.exports = {
  harmony: {
    tvl: getUniTVL({ factory, chain: 'harmony', useDefaultCoreAssets: true, }),
    staking: staking("0xa9ce83507d872c5e1273e745abcfda849daa654f", "0x72cb10c6bfa5624dd07ef608027e366bd690048f", "harmony"),
  },
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],
};
