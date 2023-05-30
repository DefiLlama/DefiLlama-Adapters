const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      chain: 'ethpow',
      useDefaultCoreAssets: true,
      factory: '0x1Ee0fe7f80BeA6353b137B2E7DCA9e26F3c6F442',
    })
  }
};