const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: getUniTVL({ factory: '0xc62Ca231Cd2b0c530C622269dA02374134511a36', useDefaultCoreAssets: true,  })
  }
}