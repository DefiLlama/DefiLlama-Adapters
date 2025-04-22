const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: "0xfDC8ec444F482Fe8aFe0a00114548DC9ff729568",
    }),
  },
};
