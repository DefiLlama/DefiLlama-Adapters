const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  multivac: {
    tvl: getUniTVL({
      factory: '0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD',
      useDefaultCoreAssets: true,
    })
  }
};