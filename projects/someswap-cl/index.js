const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  monad: { factory: '0xF4B30295EA24938d9705E30F88e144140422BAa3', fromBlock: 51858852 },
}

const abi = {
  "PairCreated": "event PairCreated(address indexed token0, address indexed token1, address indexed module, address pair, uint256 pairCount, uint8 moduleMask, (uint32 baseFee, uint32 wToken0, uint32 wToken1) baseFeeConfig)",
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: abi.PairCreated, fromBlock, })
      const ownerTokens = logs.map(log => [[log.token0, log.token1], log.pair])
      return api.sumTokens({ ownerTokens, })
    }
  }
})