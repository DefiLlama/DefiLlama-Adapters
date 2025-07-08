const { uniTvlExports } = require('../helper/unknownTokens')

module.exports = uniTvlExports({
  'base': '0x420DD381b31aEf6683db6B902084cB0FFECe40Da'
}, {
  abis: {

    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})