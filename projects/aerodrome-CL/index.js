const { getUniTVL } = require('../helper/unknownTokens.js')
const { mergeExports } = require('../helper/utils')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: "function allPools(uint) view returns (address)",
}

const config = {
  base: {
    factories: [
      '0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A',
      '0xaDe65c38CD4849aDBA595a4323a8C7DdfE89716a',
      '0x9592CD9B267748cbfBDe90Ac9F7DF3c437A6d51B',
      '0xf8f2eB4940CFE7d13603DDDD87f123820Fc061Ef',
    ],
    blacklistedTokens: ['0xdbfefd2e8460a6ee4955a68582f85708baea60a3'],
  },
}

const exportsList = []
Object.entries(config).forEach(([chain, { factories, blacklistedTokens }]) => {
  factories.forEach(factory => {
    exportsList.push({ [chain]: { tvl: getUniTVL({ factory, blacklistedTokens, fetchBalances: true, abis, permitFailure: true, useDefaultCoreAssets: false, }) } })
  })
})

module.exports = mergeExports(exportsList)
