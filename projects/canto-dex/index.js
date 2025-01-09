

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      factory: '0xE387067f12561e579C5f7d4294f51867E0c1cFba',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  }
};