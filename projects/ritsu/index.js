const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const { fromBlock, basicFactorys, stableFactorys, rhythmFactorys = [] } = config[api.chain]

  const logs = await Promise.all([...basicFactorys, ...stableFactorys, ...rhythmFactorys].map(factory => (getFactoryLogs(api, factory))));

  const balances = {}
  const data = []

  const reserves = await Promise.all(logs.map(log => (api.multiCall({ abi: 'function getReserves() external view returns (uint, uint)', calls: log.map(i => i.pool) }))))

  for (let i = 0; i < logs.length; i++) {
    if (i < basicFactorys.length) {
      reserves[i].forEach(([token0Bal, token1Bal], j) => {
        data.push({ token0Bal, token1Bal, token0: logs[i][j].token0, token1: logs[i][j].token1, })
      })
    } else {
      reserves[i].forEach(([reserve0, reserve1], j) => {
        sdk.util.sumSingleBalance(balances, logs[i][j].token0, reserve0)
        sdk.util.sumSingleBalance(balances, logs[i][j].token1, reserve1)
      })
    }
  }


  return transformDexBalances({ balances, data, chain: api.chain })

  async function getFactoryLogs(api, factory) {
    return getLogs({
      api,
      target: factory,
      fromBlock,
      topic: 'PoolCreated(address,address,address)',
      eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, address pool)',
      onlyArgs: true,
    })
  }
}

const config = {
  taiko: {
    fromBlock: 787,
    stableFactorys: ['0x3e846B1520E74728EFf445F1f86D348755F738d9'],
    basicFactorys: ['0xDFFee0ad5C833f2A5E610dfe9FD1aD82743eA74e'],
    rhythmFactorys: ['0x0A78CAB89a069555a18B78537f09fab24c03dECd']
  }
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })