const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x940BEb635cbEeC04720AC97FADb97205676e6aa4', useDefaultCoreAssets: true,
    })
  },
};