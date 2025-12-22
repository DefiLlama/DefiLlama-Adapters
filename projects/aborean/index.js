const { uniTvlExports } = require('../helper/unknownTokens')

module.exports = uniTvlExports({
  'abstract': '0xF6cDfFf7Ad51caaD860e7A35d6D4075d74039a6B'
}, {
  abis: {

    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})