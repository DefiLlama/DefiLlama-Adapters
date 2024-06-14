const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// https://github.com/poolshark-protocol/limit/blob/master/scripts/autogen/contract-deployments.json
const config = {
  arbitrum: { limitPoolFactory: '0x8bb5db1625adb4ae4beb94a188d33062303f8fb7', limitPoolFromBlock: 158864748 },
  scroll: { limitPoolFactory: '0x3FA761492f411EBC64A81FCf3292fdC0b677c00f', limitPoolFromBlock: 2632885  },
  mode: { limitPoolFactory: '0x3FA761492f411EBC64A81FCf3292fdC0b677c00f', limitPoolFromBlock: 3371958  },
  inevm: { limitPoolFactory: '0x3FA761492f411EBC64A81FCf3292fdC0b677c00f', limitPoolFromBlock: 126842  },
}

Object.keys(config).forEach(chain => {
  const { limitPoolFactory, limitPoolFromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: limitPoolFactory,
        eventAbi: 'event LimitPoolCreated(address pool, address token, address indexed token0, address indexed token1, uint16 indexed swapFee, int16 tickSpacing, uint16 poolTypeId)',
        onlyArgs: true,
        fromBlock: limitPoolFromBlock,
      })
      const ownerTokens = logs.map(log => [[log.token0, log.token1], log.pool])

      if (chain === 'arbitrum') {
        const logs = await getLogs({
          api,
          target: '0xd28d620853af6837d76f1360dc65229d57ba5435',
          eventAbi: 'event PoolCreated(address pool, address token, address indexed token0, address indexed token1, uint16 indexed swapFee, int16 tickSpacing, uint16 poolTypeId)',
          onlyArgs: true,
          fromBlock: 158864748,
          toBlock: 165105915,
        })
        ownerTokens.push(...logs.map(log => [[log.token0, log.token1], log.pool]))
      }
      return sumTokens2({ ownerTokens, api })
    }
  }
})
