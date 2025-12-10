const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  cronos: { factory: '0x3AAAB2384e40C2F405EF87Ea7B893B406C32E59C' },
}

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({
      factory,
      fetchBalances: true,
      useDefaultCoreAssets: true,
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint) view returns (address)',
      },
    }),
  }
})
