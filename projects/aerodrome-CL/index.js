const { getUniTVL } = require('../helper/unknownTokens.js')
const { mergeExports } = require('../helper/utils')

const blacklistedTokens = ['0xdbfefd2e8460a6ee4955a68582f85708baea60a3']

const export1 = {
  base: {
    tvl: getUniTVL({
      factory: '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A', blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

const export2 = {
  base: {
    tvl: getUniTVL({
      factory: '0xaDe65c38CD4849aDBA595a4323a8C7DdfE89716a', blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

module.exports = mergeExports([export1, export2])
