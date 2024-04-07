const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({ factory: '0xfb6E929c365CDe89aB9253D3BBcDCbCcEF780990', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
};
