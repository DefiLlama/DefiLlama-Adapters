const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xdC323d16C451819890805737997F4Ede96b95e3e',
    })
  }
};
