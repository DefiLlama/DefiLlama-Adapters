const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: uniTvlExport("0x2D9A3a2bd6400eE28d770c7254cA840c82faf23f", undefined, undefined, {
      allPairsLength: 'uint256:allPairsLength',
      allPairs: 'function allPairs(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}
