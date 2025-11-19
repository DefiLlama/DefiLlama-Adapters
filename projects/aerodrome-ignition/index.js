const { getUniTVL } = require('../helper/unknownTokens.js')

const config = {
  base: { factory: '0xade65c38cd4849adba595a4323a8c7ddfe89716a', blacklistedTokens: [] },
}

Object.keys(config).forEach(chain => {
  const { factory, blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({
      factory, blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      }
    })
  }
})