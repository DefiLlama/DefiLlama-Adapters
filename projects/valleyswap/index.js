const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  oasis: {
    tvl: getUniTVL({
      factory: '0xa25464822b505968eEc9A45C43765228c701d35f',
      useDefaultCoreAssets: true,
      blacklistedTokens: ['0x6Cb9750a92643382e020eA9a170AbB83Df05F30B', '0x94fbffe5698db6f54d6ca524dbe673a7729014be'],
    }),
  },
  misrepresentedTokens: true,
  hallmarks: [
    [1681743600,"Remove Fake USDT"],
    [1654214400, "EvoDefi bridge depeg"]
  ],
};
