const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: uniTvlExport("0xC7ee0B06c2d9c97589bEa593c6E9F6965451Fe93", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}