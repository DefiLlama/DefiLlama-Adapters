const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0xf86B4F41A9DdEcB4d9Be4985A8A78b6221d6D881',
      chain: 'era',
      useDefaultCoreAssets: true,
    })
  },
}; 