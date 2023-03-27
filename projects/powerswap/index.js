const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      factory: '0xD51CFEb0fa23101f67cF62EB02D0a82A4BaD52b7', 
      chain: 'ethpow', 
      useDefaultCoreAssets: true
    })
  },
};