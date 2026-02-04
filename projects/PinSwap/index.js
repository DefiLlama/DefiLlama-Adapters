const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  iotex: {
    tvl: getUniTVL({
      factory: "0x0A753dD1AFDE272a2d4bf55dF616568744201577",
      useDefaultCoreAssets: true,
    }),
  },
};
