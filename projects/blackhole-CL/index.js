const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  avax: { factory: '0x512eb749541B7cf294be882D636218c84a5e9E5F', blacklistedTokens: [''] },
}

Object.keys(config).forEach(chain => {
  const { factory, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({
      factory, blacklistedTokens, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPairsLength',
        allPairs: "function allPairs(uint) view returns (address)",
      }
    })
  }
})