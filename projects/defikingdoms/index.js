const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens");


module.exports = {
  harmony: {
    tvl: getUniTVL({ factory: '0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7', chain: 'harmony', useDefaultCoreAssets: true }),
    staking: staking("0xa9ce83507d872c5e1273e745abcfda849daa654f", "0x72cb10c6bfa5624dd07ef608027e366bd690048f", "harmony"),
  },
  klaytn: {
    tvl: getUniTVL({ factory: '0x36fAE766e51f17F8218C735f58426E293498Db2B', chain: 'klaytn', useDefaultCoreAssets: true }),
    staking: staking("0xaa8548665bcc12c202d5d0c700093123f2463ea6", "0x30c103f8f5a3a732dfe2dce1cc9446f545527b43", "klaytn"),
  },
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],
};
