const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const { fromBlock, stableFactory, classicFactory, } = config[api.chain]
  const stableLogs = await getFactoryLogs(api, stableFactory)
  const classicLogs = await getFactoryLogs(api, classicFactory)
  const balances = {}
  const data = []
  const stableReserves = await api.multiCall({ abi: 'function getReserves() external view returns (uint, uint)', calls: stableLogs.map(i => i.pool) })
  const classicReserves = await api.multiCall({ abi: 'function getReserves() external view returns (uint, uint)', calls: classicLogs.map(i => i.pool) })
  stableReserves.forEach(([reserve0, reserve1], i) => {
    sdk.util.sumSingleBalance(balances, stableLogs[i].token0, reserve0)
    sdk.util.sumSingleBalance(balances, stableLogs[i].token1, reserve1)
  })
  classicReserves.forEach(([token0Bal, token1Bal], i) => {
    data.push({ token0Bal, token1Bal, token0: classicLogs[i].token0, token1: classicLogs[i].token1, })
  })
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
  era: { fromBlock: 9775, stableFactory: '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3', classicFactory: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb', },
  linea: { fromBlock: 716, stableFactory: '0xE4CF807E351b56720B17A59094179e7Ed9dD3727', classicFactory: '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d', },
  scroll: { fromBlock: 80875, stableFactory: '0xE4CF807E351b56720B17A59094179e7Ed9dD3727', classicFactory: '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d', },
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })
