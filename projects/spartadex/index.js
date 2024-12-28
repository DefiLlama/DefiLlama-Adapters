const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl: getUniTVL({ factory: '0xFe8EC10Fe07A6a6f4A2584f8cD9FE232930eAF55', useDefaultCoreAssets: true, }), },
  linea: { tvl: getUniTVL({ factory: '0x9E4Fc4a5A0769ba74088856C229c4a1Db2Ea5A9e', useDefaultCoreAssets: true, }), },
}