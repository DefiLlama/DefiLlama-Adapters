const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  arbitrum: {
    tvl: getUniTVL({ factory: '0x2f0a2b314eecc6ba33b3dd4f46816a2196c8af3a',  useDefaultCoreAssets: true, })
  }
}