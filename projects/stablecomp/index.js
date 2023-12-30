const config = require("./contracts.json");

Object.keys(config).forEach(chain => {
  let {vaults} = config[chain]
  vaults = Object.values(vaults)
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const tokens = await api.multiCall({  abi: 'address:token', calls: vaults})
      const bals = await api.multiCall({  abi: 'uint256:balance', calls: vaults})
      api.addTokens(tokens, bals)
      return api.getBalances()
    }
  }
})