const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: getUniTVL({
      factory: '0x2131Bdb0E0B451BC1C5A53F2cBC80B16D43634Fa',
      useDefaultCoreAssets: true,
    })
  },
  base: {
    tvl: getUniTVL({
      factory: '0x3512DA8F30D9AE6528e8e0787663C14Fe263Fbea',
      useDefaultCoreAssets: true,
    })
  }
};