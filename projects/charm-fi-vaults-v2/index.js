const config = {
  ethereum: {},
  arbitrum: {},
  optimism: {},
  polygon: {},
  base: {},
  boba: { factory: '0xFaf1Af4dC761dBA157227a3c06CeC9A7486D8a07' },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { factory = '0x5B7B8b487D05F77977b7ABEec5F922925B9b2aFa' } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await api.fetchList({ lengthAbi: 'uint256:numVaults', itemAbi: 'function vaults(uint) view returns (address)', target: factory })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: vaults })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: vaults })
      const bals = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 bal0, uint256 bal1)', calls: vaults })
      bals.forEach(({ bal0, bal1 }, i) => {
        api.add(token0s[i], bal0)
        api.add(token1s[i], bal1)
      })
      return api.getBalances()
    }
  }
})