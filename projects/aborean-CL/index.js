const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  abstract: { factory: '0x8cfE21F272FdFDdf42851f6282c0f998756eEf27', blacklistedTokens: [] },
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