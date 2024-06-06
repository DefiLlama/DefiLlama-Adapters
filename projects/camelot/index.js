const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  start: 1669075200,
  arbitrum: {
    tvl: getUniTVL({ factory: '0x6EcCab422D763aC031210895C81787E87B43A652', useDefaultCoreAssets: true,}),
  },
};