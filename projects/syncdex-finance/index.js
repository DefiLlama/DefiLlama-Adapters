const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x1A15e21cc6C26d48EE79DC45F704E9593ffbA81A',
      useDefaultCoreAssets: true,
    })
  },
};