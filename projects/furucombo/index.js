const { getLogs } = require('../helper/cache/getLogs')
const config = {
  polygon: { factory: '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304', fromBlock:   29080112   },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event FundCreated (address indexed newFund, address comptroller, address shareToken, address vault)',
        onlyArgs: true,
        fromBlock,
      })
      const tokens = await api.multiCall({  abi: 'address[]:getAssetList', calls: logs.map(l => l.newFund) })
      const ownerTokens = tokens.map((t, i) => [t, logs[i].vault])
      return api.sumTokens({ ownerTokens })
    }
  }
})