const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl: getUniTVL({
      factory: "0x92aF10c685D2CF4CD845388C5f45aC5dc97C5024",
      useDefaultCoreAssets: true,
      hasStablePools: true
    }),
  }
};
