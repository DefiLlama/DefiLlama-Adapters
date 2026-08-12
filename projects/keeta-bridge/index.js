const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  base : { bridge: '0x1c24a0fb7bcf2154a9d37b7b3aa443bc63fcc698', fromBlock: 35899017},
}

Object.keys(config).forEach(chain => {
  const { bridge: factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: "event TokenAdded(address indexed token)", fromBlock, })
      const tokens = logs.map(i => i.token)
      return api.sumTokens({ tokens, owner: factory })
    }
  }
})