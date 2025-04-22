const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  astar: {
    tvl: async (api) => {
      const bal = await api.call({  abi: 'uint256:internalDotBalance', target: '0x5E60Af4d06A9fc89eb47B39b5fF1b1b42a19ef39'}) 
      api.add(ADDRESSES.astar.DOT, bal)
    }
  }
}