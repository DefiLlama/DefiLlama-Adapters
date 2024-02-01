const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  cube: {
    /* tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x33CB4150f3ADFCD92fbFA3309823A2a242bF280f',
    }) */
    tvl: () => ({})
  }
};