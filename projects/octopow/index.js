const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      chain: 'ethpow',
      useDefaultCoreAssets: true,
      factory: '0x3a69E908fA1614e445720Ab816a0CD51e5dc6FeC',
    })
  }
};