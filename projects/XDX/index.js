const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  blast: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xF55dE36072beCebF162d2d54C49964f3b0683711',
    })
  }
}