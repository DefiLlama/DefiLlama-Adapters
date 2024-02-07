const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  base: { tvl: getUniTVL({ factory: '0x1b8128c3a1b7d20053d10763ff02466ca7ff99fc', useDefaultCoreAssets: true, }), },
}
