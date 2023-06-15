const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x0ddb9d635cb92720896de709d18069450942dbba',
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};
