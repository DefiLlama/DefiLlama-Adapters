const { getUniTVL } = require('../helper/unknownTokens')

const chain = 'bsc'

module.exports = {
  dogechain: {
    tvl: getUniTVL({
      chain,
      //useDefaultCoreAssets: true,
      factory: '0x4693B62E5fc9c0a45F89D62e6300a03C85f43137',
    }),
  },
}
