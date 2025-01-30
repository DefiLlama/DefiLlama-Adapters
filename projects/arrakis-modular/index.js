const config = {
  ethereum: {
    factory: '0x820FB8127a689327C863de8433278d6181123982',
    fromBlock: 20540819,
  },
  arbitrum: {
    factory: '0x820FB8127a689327C863de8433278d6181123982',
    fromBlock: 243467827,
  },
  base: {
    factory: '0x820FB8127a689327C863de8433278d6181123982',
    fromBlock: 18512550,
  },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const numPublicVaults = await api.call({ abi: 'uint256:numOfPublicVaults', target: factory })
      const numPrivateVaults = await api.call({ abi: 'uint256:numOfPrivateVaults', target: factory })
      const publicVaults = numPublicVaults > 0 ? await api.call({ abi: 'function publicVaults(uint256 startIndex_, uint256 endIndex_) returns (address[] memory)', target: factory, params: [0, numPublicVaults] }) : []
      const privateVaults = numPrivateVaults > 0 ? await api.call({ abi: 'function privateVaults(uint256 startIndex_, uint256 endIndex_) returns (address[] memory)', target: factory, params: [0, numPrivateVaults] }) : []
      const vaults = [...publicVaults, ...privateVaults]
      const [token0s, token1s, bals] = await Promise.all([
        api.multiCall({ abi: 'address:token0', calls: vaults }),
        api.multiCall({ abi: 'address:token1', calls: vaults }),
        api.multiCall({ abi: 'function totalUnderlying() view returns (uint256, uint256)', calls: vaults }),
      ])

      bals.forEach(([v0, v1], i) => {
        api.add(token0s[i], v0)
        api.add(token1s[i], v1)
      })
    }
  }
})