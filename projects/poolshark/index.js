const { getLogs } = require('../helper/cache/getLogs')

// https://github.com/poolshark-protocol/limit/blob/master/scripts/autogen/contract-deployments.json
const config = {
  arbitrum: { limitPoolFactory: '0xd28d620853af6837d76f1360dc65229d57ba5435', limitPoolFromBlock: 158864748 },
}

Object.keys(config).forEach(chain => {
  const { limitPoolFactory, limitPoolFromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: limitPoolFactory,
        eventAbi: 'event PoolCreated(address pool, address token, address indexed token0, address indexed token1, uint16 indexed swapFee, int16 tickSpacing, uint16 poolTypeId)',
        onlyArgs: true,
        fromBlock: limitPoolFromBlock,
      })
      const ownerTokens = logs.map(log => [[log.token0, log.token1], log.pool])
      return api.sumTokens({ ownerTokens })
    }
  }
})