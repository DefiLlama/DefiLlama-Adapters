const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x661B92cc18a8d73209dBa1394aE56fca2F9DDb4D',
    }),
  },
  arbitrum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x661B92cc18a8d73209dBa1394aE56fca2F9DDb4D',
    }),
  }
};
