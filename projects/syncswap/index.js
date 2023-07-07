const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const vault = '0x621425a1Ef6abE91058E9712575dcc4258F8d091'

async function getFactoryLogs(api, factory) {
  return getLogs({
    api,
    target: factory,
    fromBlock: 9775,
    topic: 'PoolCreated(address,address,address)',
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, address pool)',
    onlyArgs: true,
  })
}

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const stableLogs = await getFactoryLogs(api, '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3')
  const classicLogs = await getFactoryLogs(api, '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb')
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
  return transformDexBalances({ balances, data, chain: 'era' })
}

module.exports = {
  misrepresentedTokens: true,
  era: { tvl, }
}