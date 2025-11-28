const { uniTvlExports } = require('../helper/unknownTokens')

module.exports = uniTvlExports({
  'mezo': '0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248'
}, {
  abis: {

    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})