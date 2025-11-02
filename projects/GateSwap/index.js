const { getUniTVL } = require("../helper/unknownTokens")

const config = {
  gatelayer: '0xaD8d59f3e026c02Aed0DAdFB46Ceca127030DFa2'
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true }),
  }
})
