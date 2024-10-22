const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  apechain: { tvl: getUniTVL({ factory: '0x62c2022Be8F27eA8e20A5233EB96bAF75A503DE4', useDefaultCoreAssets: true, }), },
}