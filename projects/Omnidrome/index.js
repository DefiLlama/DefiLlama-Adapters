const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  zeta: {
    tvl: uniTvlExport("0x769d1BcB5FDf30F5a9D19f1ab8A3cF8b60a6e855", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { fetchBalances: true, useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}
