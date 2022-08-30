const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  tombchain: {
    tvl: getUniTVL({
      chain: 'tombchain',
      useDefaultCoreAssets: true,
      factory: '0x69Da8FFe6550A3D78dBff368194d490fB30703f9',
    }),
  }
}; // node test.js projects/lif3-swap/index.js
