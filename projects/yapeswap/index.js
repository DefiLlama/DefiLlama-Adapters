const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({ factory: '0x46aDc1C052Fafd590F56C42e379d7d16622835a2', useDefaultCoreAssets: true, }), 
  },
};
