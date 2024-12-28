const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  xdc: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x347D14b13a68457186b2450bb2a6c2Fd7B38352f',
    })
  },
}