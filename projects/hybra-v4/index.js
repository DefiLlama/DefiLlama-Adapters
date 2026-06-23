const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  hyperliquid: { factory: '0x32b9dA73215255d50D84FeB51540B75acC1324c2', fromBlock: 16715971, },
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