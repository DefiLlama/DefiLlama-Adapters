const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      hasStablePools: true,
      fetchBalances: true,
      factory: '0x5Bcd9eE6C31dEf33334b255EE7A767B6EEDcBa4b',
    }),
  },
}