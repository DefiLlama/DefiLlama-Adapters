const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0xE01cF83a89e8C32C0A9f91aCa7BfE554EBEE7141";

module.exports = {
  avax: {
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      useDefaultCoreAssets: true,
    }),
  },
};