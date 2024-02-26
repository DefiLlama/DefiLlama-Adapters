const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: uniTvlExport("0x9697552931f5f2c7287db7Ee3a6aEB5c8DE21870", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}