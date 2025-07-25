const { getLogs2 } = require('../helper/cache/getLogs')

// https://developer.pancakeswap.finance/contracts/infinity/resources/addresses
const config = {
  bsc: { vault: '0x238a358808379702088667322f80ac48bad5e6c4', clPoolManager: '0xa0ffb9c1ce1fe56963b0321b32e7a0302114058b', fromBlock: 47214308 },
}

Object.keys(config).forEach(chain => {
  const { vault, clPoolManager, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        target: clPoolManager,
        fromBlock,
        eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
      })
      const tokenSet = new Set()
      logs.forEach(log => {
        tokenSet.add(log.currency0)
        tokenSet.add(log.currency1)
      })
      const tokens = Array.from(tokenSet)
      return api.sumTokens({ tokens, owner: vault, })
    }
  }
})