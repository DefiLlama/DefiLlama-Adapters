
const config = {
  btr: { factory: '0xe4fb0d76c7ba28dd4d115ff63c0b14d8d7f9838a', },
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await api.fetchList({ lengthAbi: 'pool_count', itemAbi: 'pool_list', target: factory })
      const tokens = await api.multiCall({ abi: 'function get_coins(address) view returns (address[])', calls: pools, target: factory })
      const ownerTokens = pools.map((p, i) => [tokens[i], p])
      return api.sumTokens({ ownerTokens, blacklistedTokens: pools })
    }
  }
})