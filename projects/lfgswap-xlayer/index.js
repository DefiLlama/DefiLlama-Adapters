const { getUniTVL } = require('../helper/unknownTokens');


module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x0F6DcC7a1B4665b93f1c639527336540B2076449',
    })
  }
}