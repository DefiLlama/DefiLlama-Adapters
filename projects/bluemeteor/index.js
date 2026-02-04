const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  pulse: { tvl: getUniTVL({ factory: '0x2c68d8942fD4B5eC45a671fA230fb3dEBF224176', useDefaultCoreAssets: true,  }), },
}