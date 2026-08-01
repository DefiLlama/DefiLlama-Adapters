const config = {
  era: '0xf7c504346b27F6073F7182e61f870531Fca1c09d',
  scroll: '0x30e44f48c9542533cB0b6b7dA39F6d42F26D843f',
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