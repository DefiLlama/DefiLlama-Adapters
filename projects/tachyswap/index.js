const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  etlk: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x033eff22bC5Bd30c597e1fdE8Ca6fB1C1274C688',
    })
  }
}