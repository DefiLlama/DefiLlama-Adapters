const {getUniTVL} = require('../helper/unknownTokens.js')
const config = {
  base: { factory: '0x9592CD9B267748cbfBDe90Ac9F7DF3c437A6d51B'},
}

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, fetchBalances: true, abis: {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: "function allPools(uint) view returns (address)",
     } })
  }
})