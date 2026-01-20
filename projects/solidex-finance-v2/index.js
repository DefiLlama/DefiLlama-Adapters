const { uniTvlExports } = require('../helper/unknownTokens')

module.exports = uniTvlExports({
  'cronos': '0xc6bd451EE56E8e42b8dde3921aD851645C416126'
}, {
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  },
  hasStablePools: true,
  permitFailure: true,
})


