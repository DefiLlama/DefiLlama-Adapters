const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x0944AB692786D9104AE9a29778285c41C33c0415', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};