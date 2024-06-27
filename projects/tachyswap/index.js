const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  etherlink: {
    tvl: getUniTVL({
      fetchBalances: true,
      useDefaultCoreAssets: true,
      factory: '0x033eff22bC5Bd30c597e1fdE8Ca6fB1C1274C688',
    })
  }
}