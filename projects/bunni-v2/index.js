const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493'], fromBlock: 21747552 },
  base: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493'], fromBlock: 25786936 },
  arbitrum: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493'], fromBlock: 301323941 },
  unichain: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493', '0x00000091cb2d7914c9cd196161da0943ab7b92e1'], fromBlock: 11682827 },
  bsc: { factories: ['0x000000dceb71f3107909b1b748424349bfde5493'], fromBlock: 48224121 },
}

Object.keys(config).forEach(chain => {
  const { factories, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      for (const factory of factories) {
        const logs = await getLogs2({ api, factory, eventAbi: 'event NewBunni (address indexed bunniToken, bytes32 indexed poolId)', fromBlock, skipCache: true })
        const bunnis = logs.map(log => log.bunniToken)
        const poolIds = logs.map(log => log.poolId)
        const token0s = await api.multiCall({ abi: 'address:token0', calls: bunnis })
        const token1s = await api.multiCall({ abi: 'address:token1', calls: bunnis })
        const balances = await api.multiCall({ abi: 'function poolBalances(bytes32) view returns (uint256 token0, uint256 token1)', calls: poolIds, target: factory, permitFailure: true })
  
        const balances0 = balances.map(b => b?.token0 ?? 0)
        const balances1 = balances.map(b => b?.token1 ?? 0)
        api.add(token0s, balances0)
        api.add(token1s, balances1)
      }
    }
  }
})

module.exports.doublecounted = true