const { getLogs } = require("../helper/cache/getLogs")
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    ladle: '0x93343c08e2055b7793a3336d659be348fc1b08f9',
    fromBlock: 129978,
  },
  ethereum: {
    ladle: '0x30E7348163016B3b6E1621A3Cb40e8CF33CE97db',
    fromBlock: 16074982,
  },
}

Object.keys(config).forEach(chain => {
  const { ladle, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const cauldron = await api.call({
        target: ladle,
        abi: 'address:cauldron',
      })

      const logs = await getLogs({
        api, target: cauldron, fromBlock,
        topic: 'IlkAdded(bytes6,bytes6)', eventAbi: abis.IlkAdded,
      })
      const ilkIds = logs.map((log) => log.args.ilkId)

      const joins = await api.multiCall({
        target: ladle,
        calls: ilkIds,
        abi: abis.joins,
      })
      const tokens = await api.multiCall({
        abi: 'address:asset',
        calls: joins,
      })
      const tokensAndOwners = joins.map((t, i) => ([tokens[i], t]))
      return sumTokens2({ api, tokensAndOwners, })
    }
  }
})

const abis = {
  joins: "function joins(bytes6) view returns (address)",
  IlkAdded: "event IlkAdded(bytes6 indexed seriesId, bytes6 indexed ilkId)",
}