const config = {
  heco: ['0x1cF73836aE625005897a1aF831479237B6d1e4D2', '0xE1f39a72a1D012315d581c4F35bb40e24196DAc8'],
  bsc: ['0x7033A512639119C759A51b250BfA461AE100894b'],
  polygon: ['0xE95876787B055f1b9E4cfd5d3e32BDe302BF789d'],
  okexchain: ['0xa8AF3199aCE72E47c1DEb56E58BEA1CD41C37c22']
}
module.exports.misrepresentedTokens = true

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const bals = await api.multiCall({ abi: "function getGlobalStatistics() view returns (uint256, uint256)", calls: config[chain] })
      const divider = chain !== 'polygon' ? 1e18 : 1e6
      bals.forEach(([i]) => api.addCGToken('tether', i / divider))
      return api.getBalances()
    }
  }
})
