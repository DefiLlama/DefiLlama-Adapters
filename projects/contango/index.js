const { getLogs } = require("../helper/cache/getLogs")
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

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

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { ladle, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (timestamp, _b, chainBlocks) => {
      const block = chainBlocks[chain]
      const cauldron = await sdk.api2.abi.call({
        target: ladle,
        abi: 'address:cauldron',
        chain, block,
      })

      const logs = await getLogs({
        chain, target: cauldron, fromBlock, timestamp, chainBlocks,
        topic: 'IlkAdded(bytes6,bytes6)', eventAbi: abis.IlkAdded,
      })
      const ilkIds = logs.map((log) => log.args.ilkId)

      const joins = await sdk.api2.abi.multiCall({
        target: ladle,
        calls: ilkIds,
        abi: abis.joins,
        chain, block,
      })
      const tokens = await sdk.api2.abi.multiCall({
        abi: 'address:asset',
        calls: joins,
        chain, block,
      })
      const tokensAndOwners = joins.map((t, i) => ([tokens[i], t]))
      return sumTokens2({ chain, block, tokensAndOwners, })
    }
  }
})

const abis = {
  joins: {"inputs":[{"internalType":"bytes6","name":"","type":"bytes6"}],"name":"joins","outputs":[{"internalType":"contract IJoin","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  IlkAdded: {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes6","name":"seriesId","type":"bytes6"},{"indexed":true,"internalType":"bytes6","name":"ilkId","type":"bytes6"}],"name":"IlkAdded","type":"event"},
}