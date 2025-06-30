const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'base': '0xF60caCf0A3daa5B6a79ca6594BEF38F85391AE0A'
}, {
  deadFrom: 1732734407,
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
  hallmarks: [
    [1732734407,"Rug Pull"]
  ],
})