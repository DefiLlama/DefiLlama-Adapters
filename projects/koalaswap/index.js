const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0xcF3Ee60d29531B668Ae89FD3577E210082Da220b' // KoalaSwap factory
const startBlocks = {
  unit0: 2291892,
}

const tvl = async (api) => {
  const START_BLOCK = startBlocks[chain]
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: START_BLOCK,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  })

  const ownerTokens = []
  for (let log of logs) {
    ownerTokens.push([[log.token0, log.token1], log.pool])
  }

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'TVL consists of tokens locked in KoalaSwap V3 liquidity pools.',
  unit0: { tvl, },
}
