const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'sonic': '0x385AC659B50dF7f90755f974409D02dc21ea8bB0'
}, {
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})