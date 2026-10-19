const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const POOL_CREATED_EVENT = 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'

// V3 and V3.1 are separate factory generations with the same pool interface; both are live and both are counted.
const CONFIG = {
  robinhood: [
    { factory: '0x6307fc239C7964942c1BfFE51930E55606619c74', fromBlock: 9539103 }, // V3
    { factory: '0x8f419898da502d3f49ef379775507210de2bfe3a', fromBlock: 68225870 }, // V3.1
  ],
  arc: [
    { factory: '0x6307fc239C7964942c1BfFE51930E55606619c74', fromBlock: 12953009 }, // V3
    { factory: '0x84169f9adf4f5f0e483bfc350498a85b1d7ec638', fromBlock: 21893415 }, // V3.1
  ],
}

async function tvl(api, factories) {
  const ownerTokens = []
  for (const { factory, fromBlock } of factories) {
    if (api.block && api.block < fromBlock) continue
    const pools = await getLogs({ api, target: factory, fromBlock, eventAbi: POOL_CREATED_EVENT, onlyArgs: true })
    pools.forEach(({ token0, token1, pool }) => ownerTokens.push([[token0, token1], pool]))
  }
  return sumTokens2({ api, ownerTokens, permitFailure: ownerTokens.length > 2000 })
}

module.exports = {
  methodology: 'Counts both sides of every pool created by the Synthra V3 and V3.1 factories.',
}

Object.entries(CONFIG).forEach(([chain, factories]) => {
  module.exports[chain] = { tvl: (api) => tvl(api, factories) }
})
