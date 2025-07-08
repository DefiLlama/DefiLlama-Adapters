const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'zeta': '0x769d1BcB5FDf30F5a9D19f1ab8A3cF8b60a6e855'
}, {
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})