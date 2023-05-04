const { sumTokens2 } = require('../helper/unwrapLPs')
const config = {
  arbitrum: '0x336a2f76d2be24e7cb6f468665a4277d4d617d00',
  ethereum: '0x408f66057163d829a30d4d466092c6b0eebb692f',
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const pairs = await api.fetchList({  lengthAbi: 'uint256:allPairsLength', itemAbi: 'function allPairs(uint256) view returns (address)', target: factory})
      const tokenA = await api.multiCall({  abi: 'address:tokenA', calls: pairs}) 
      const tokenB = await api.multiCall({  abi: 'address:tokenB', calls: pairs}) 
      return sumTokens2({ api, ownerTokens: pairs.map((v, i) => [[tokenA[i], tokenB[i]], v])})
    }
  }
})