const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  avax: {
    tvl: getUniTVL({ factory: '0xcDE3F9e6D452be6d955B1C7AaAEE3cA397EAc469',  useDefaultCoreAssets: true})
  }
}