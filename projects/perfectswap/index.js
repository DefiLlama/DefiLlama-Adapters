
const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'arbitrum': '0xC7ee0B06c2d9c97589bEa593c6E9F6965451Fe93'
}, {
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  }, hasStablePools: true,
})