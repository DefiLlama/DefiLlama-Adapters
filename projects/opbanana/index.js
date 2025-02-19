const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  op_bnb: { tvl: getUniTVL({ factory: '0xdF9161aa1D60f129E185D43e2862BD4826E88Aa8', useDefaultCoreAssets: true, }), },
}