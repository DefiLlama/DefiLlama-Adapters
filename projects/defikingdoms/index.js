const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens");


module.exports = {
  harmony: {
    tvl: getUniTVL({ factory: '0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7', useDefaultCoreAssets: true }),
    staking: staking(ADDRESSES.harmony.xJEWEL, ADDRESSES.harmony.JEWEL),
  },
  klaytn: {
    tvl: getUniTVL({ factory: '0x36fAE766e51f17F8218C735f58426E293498Db2B', useDefaultCoreAssets: true }),
    staking: staking("0xaa8548665bcc12c202d5d0c700093123f2463ea6", "0x30c103f8f5a3a732dfe2dce1cc9446f545527b43"),
  },
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],
};
