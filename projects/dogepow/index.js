const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      chain: 'ethpow',
      useDefaultCoreAssets: true,
      factory: '0xe702718cE7031e1809358da6b75CE6fc35DC8284',
    })
  }
};