const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  base: { factory: '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A', blacklistedTokens: ['0xdbfefd2e8460a6ee4955a68582f85708baea60a3'] },
}

Object.keys(config).forEach(chain => {
  const { factory, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({
      factory, blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      }
    })
  }
})