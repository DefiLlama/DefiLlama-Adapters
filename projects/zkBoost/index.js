const abi = require('./abi')
const config = require('./config')
const { sumTokens2 } = require("../helper/unwrapLPs")

module.exports = {}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const {chain} = api
      const { vaults, } = config[chain]
      for (const vault of vaults) {
        const data = await api.fetchList({  lengthAbi: abi.getTotalLockCount, itemAbi: abi.getLockAt, target: vault })
        await sumTokens2({ api, owner: vault, tokens: data.map(i => i.token), resolveLP: true, })
      }
      return api.getBalances()
    }
  }
})