const { sumTokens2 } = require('../helper/unwrapLPs')
const config = require('./config.json')

Object.keys(config).forEach(chain => {
  const pools = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({  abi: 'address:want', calls: pools})      
      const bals = await api.multiCall({  abi: 'uint256:balance', calls: pools})      
      api.addTokens(tokens, bals)
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})