const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x3587B8c0136c2C3605a9E5B03ab54Da3e4044b50', }),
  },
}