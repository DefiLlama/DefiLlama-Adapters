const { uniTvlExports } = require('../helper/unknownTokens')

module.exports = uniTvlExports({
  'xrplevm': '0xa9833699fBB0E3759a3C381DeB43A61Df99e8544'
}, {
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})
