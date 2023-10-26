const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl: getUniTVL({
      factory: '0x23537BCe0533e53609A49dffdd400e54A825cb81',
      useDefaultCoreAssets: true,
      hasStablePools: true,
      fetchBalances: true,
    })
  }
}