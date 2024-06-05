const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const { fromBlock, classicFactorys, stableFactorys, aquaFactorys = [] } = config[api.chain]

  const logs = await Promise.all([...classicFactorys, ...stableFactorys, ...aquaFactorys].map(factory => (getFactoryLogs(api, factory))));

  const balances = {}
  const data = []

  const reserves = await Promise.all(logs.map(log => (api.multiCall({ abi: 'function getReserves() external view returns (uint, uint)', calls: log.map(i => i.pool) }))))

  for (let i = 0; i < logs.length; i++) {
    if (i < classicFactorys.length) {
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
  era: {
    fromBlock: 9775,
    stableFactorys: ['0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3'],
    classicFactorys: ['0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb'],
    aquaFactorys: ['0x20b28B1e4665FFf290650586ad76E977EAb90c5D']
  },
  linea: {
    fromBlock: 716,
    stableFactorys: ['0xE4CF807E351b56720B17A59094179e7Ed9dD3727'],
    classicFactorys: ['0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d'],
  },
  scroll: {
    fromBlock: 80875,
    stableFactorys: ['0xE4CF807E351b56720B17A59094179e7Ed9dD3727'],
    classicFactorys: ['0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d'],
  },
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })