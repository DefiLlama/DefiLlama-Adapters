const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  xdc: {
    tvl: getUniTVL({ factory: "0x9fAb572F75008A42c6aF80b36Ab20C76a38ABc4B", useDefaultCoreAssets: true, }),
  },
};