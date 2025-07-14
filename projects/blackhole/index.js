const { uniTvlExports } = require('../helper/unknownTokens')

module.exports = uniTvlExports({
  'avax': '0xfE926062Fb99CA5653080d6C14fE945Ad68c265C'
}, {
  abis: {

    allPairsLength: 'uint256:allPairsLength',
    allPairs: 'function allPairs(uint256) view returns (address)',
  }, hasStablePools: true,
})