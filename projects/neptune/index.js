const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  swellchain: {
    factory: '0xD78a40cA54090f4178c9c9212c78e9E0C2722231',
  },
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({
      factory, useDefaultCoreAssets: true, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      }
    })
  }
})

module.exports.misrepresentedTokens = true