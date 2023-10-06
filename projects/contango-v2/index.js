const { getLogs } = require("../helper/cache/getLogs")

const config = {
  arbitrum: {
    contango: '0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E',
    fromBlock: 120103720,
  },
}

Object.keys(config).forEach(chain => {
  const { contango, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (timestamp, _b, chainBlocks, { api }) => {
      const logs = await getLogs({
        api,
        target: contango,
        eventAbi: "event InstrumentCreated(bytes16 indexed symbol, address base, address quote)",
        onlyArgs: true,
        fromBlock,
      })
      const vault = await api.call({  abi: 'address:vault', target: contango})
      return api.sumTokens({ owner: vault, tokens: logs.map(log => [log.base, log.quote]).flat()})
      
    }
  }
})
