const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl: getUniTVL({ factory: '0xFe8EC10Fe07A6a6f4A2584f8cD9FE232930eAF55', useDefaultCoreAssets: true, }), },
}