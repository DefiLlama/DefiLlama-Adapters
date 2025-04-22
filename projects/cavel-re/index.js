const config = {
  avax: { pools: ['0x5f1e8ed8468232bab71eda9f4598bda3161f48ea'], }, 
}


Object.keys(config).forEach(chain => {
  const { pools } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const poolData = await api.multiCall({  abi: abi.assets, calls: pools})
      return api.sumTokens({ ownerTokens: poolData.map((v, i) => [v.map(j => j.token), pools[i]])})
    }
  }
})

const abi = {
  "assets": "function assets() view returns (tuple(address token, uint256 index, string name, string symbol, uint8 decimals, uint256 conversion, uint256 fee, uint256 balance, uint256 meanBalance, uint256 scale, uint256 meanScale, uint256 lastUpdated)[])",
}