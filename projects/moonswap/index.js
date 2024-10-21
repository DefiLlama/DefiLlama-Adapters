const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  moonriver: {
    tvl: getUniTVL({
      factory: '0x056973f631a5533470143bb7010c9229c19c04d2',
      useDefaultCoreAssets: true,
      blacklist: [
        '0xfd301ca82d007880e678bb750a771550c5104ff2', // ANKR, bad decimal?
      ]
    })
  },
  misrepresentedTokens: true,
}