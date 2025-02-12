const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: uniTvlExport("0x27c2d144b106B26Be3d0dEB6c14c5CFA2e9a507C", undefined, undefined, {
      allPairsLength: 'uint256:allPairsLength',
      allPairs: 'function allPairs(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePairs: true, }),
  },
}