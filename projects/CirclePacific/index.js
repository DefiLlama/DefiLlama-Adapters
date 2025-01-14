const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  manta: { tvl: getUniTVL({ factory: '0xD8c3DBE9C3953Fda5e4573533e662C58A37E1455', useDefaultCoreAssets: true, }), },
}
