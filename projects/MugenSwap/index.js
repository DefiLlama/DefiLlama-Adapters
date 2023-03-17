const { getUniTVL } = require('../helper/unknownTokens')

const chain = 'arbitrum'

module.exports = {
  arbitrum: {
    tvl: getUniTVL({
      chain,
      useDefaultCoreAssets: true,
      factory: '0x5649B4DD00780e99Bab7Abb4A3d581Ea1aEB23D0',
    }),
  },
}
