const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  bsc: { factory: '0x73DC984D9490286E735548f61dfCCec67Af82ed9', blacklistedTokens: [] },
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