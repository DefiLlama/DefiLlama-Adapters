const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  avax: { tvl: getUniTVL({ factory: '0x49a5044268A54467a94905d1458A88413695afc1', useDefaultCoreAssets: true, fetchBalances: true, }), },
}
