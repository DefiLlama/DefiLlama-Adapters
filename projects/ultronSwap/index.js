const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ultron: {
    tvl: getUniTVL({
      chain: 'ultron',
      useDefaultCoreAssets: true,
      factory: '0xe1F0D4a5123Fd0834Be805d84520DFDCd8CF00b7',
    }),
  }
};