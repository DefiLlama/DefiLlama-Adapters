const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  xdc: {
    tvl: getUniTVL({
      factory: '0xA8334Aae58e5bDee692B26679c1817F9c42f8f51',
      useDefaultCoreAssets: true,
    })
  },
}