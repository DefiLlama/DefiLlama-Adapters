const {getUniTVL} = require('../helper/unknownTokens.js')
const config = {
  base: { factory: '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A'},
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