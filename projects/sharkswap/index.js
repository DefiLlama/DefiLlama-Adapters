const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  sxr: {
    tvl: getUniTVL({
      factory: '0x610CfC3CBb3254fE69933a3Ab19aE1bF2aaaD7C8',
      useDefaultCoreAssets: true,
    })
  }
}