const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1732734407,"Rug Pull"]
  ],
  base: {
    tvl: uniTvlExport("0xF60caCf0A3daa5B6a79ca6594BEF38F85391AE0A", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}