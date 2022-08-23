const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  harmony: {
    tvl: getUniTVL({
      chain: 'harmony',
      useDefaultCoreAssets: true,
      factory: '0x0Dea90EC11032615E027664D2708BC292Bbd976B',
    })
  },
};
