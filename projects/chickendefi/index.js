const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  sonic: { tvl: getUniTVL({ factory: '0x796F21EFA35bf3b0360aC8e3c108241f88E47A3a', useDefaultCoreAssets: true, }), },
}