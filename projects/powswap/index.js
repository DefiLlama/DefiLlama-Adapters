const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      chain: 'ethpow',
      useDefaultCoreAssets: true,
      factory: '0x62009bD6349A3A1d7f1bcC7C69492Cd26F1FBF75',
    })
  }
};
