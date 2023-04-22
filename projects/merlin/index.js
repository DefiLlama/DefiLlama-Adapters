const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  start: 1682899200,
  methodology: "Counts liquidity in pools and MAGE token in the stMAGE contract",
  era: {
    tvl: getUniTVL({ factory: '0x63E6fdAdb86Ea26f917496bEEEAEa4efb319229F', useDefaultCoreAssets: true,  }),
  },
};
