const config = {
  era: '0x846FcA826196B3D674fd1691Bb785F3E4216bc0F'
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await api.fetchList({ lengthAbi: 'poolLength', itemAbi: 'pools', target: factory })
      const tokens = await api.multiCall({ abi: 'address:quoteToken', calls: pools })
      return api.sumTokens({ tokensAndOwners2: [tokens, pools] })
    }
  }
})