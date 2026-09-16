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

const export3 = {
  base: {
    tvl: getUniTVL({
      factory: '0x9592CD9B267748cbfBDe90Ac9F7DF3c437A6d51B', blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

const export4 = {
  base: {
    tvl: getUniTVL({
      factory: '0xf8f2eB4940CFE7d13603DDDD87f123820Fc061Ef', blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

const exportArcCL = {
  arc: {
    tvl: getUniTVL({
      factory: '0xb89Df768aF2CFE637ceB352c587Fe8edAf491d03', fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

const exportArcStable = {
  arc: {
    tvl: getUniTVL({
      factory: '0xaEd253F1aD84d99f2165256D701b2b481DD4CC16', fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

const exportArcVolatile = {
  arc: {
    tvl: getUniTVL({
      factory: '0x9bc8b3F60D349d687Fb44A018967025E3741F9a5', fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      },
      permitFailure: true,
    })
  }
}

module.exports = mergeExports([export1, export2, export3, export4, exportArcCL, exportArcStable, exportArcVolatile])
