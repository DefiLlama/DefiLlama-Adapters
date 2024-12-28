const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  kcc: { tvl: getUniTVL({ factory: '0xc0ffee00000e1439651c6ad025ea2a71ed7f3eab', useDefaultCoreAssets: true, }), },
}
