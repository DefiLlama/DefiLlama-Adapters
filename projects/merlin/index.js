const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  start: 1682899200,
  era: {
    tvl: getUniTVL({ factory: '0x63E6fdAdb86Ea26f917496bEEEAEa4efb319229F', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
};
