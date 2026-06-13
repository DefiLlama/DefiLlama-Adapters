const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  unit0: { factory: '0xcF3Ee60d29531B668Ae89FD3577E210082Da220b', fromBlock: 2291892 }
}

const POOL_CREATED = "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)"

const tvl = async (api) => {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, target: factory, fromBlock, eventAbi: POOL_CREATED })
  const ownerTokens = logs.map((log) => ([[log.token0, log.token1], log.pool]))
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'TVL consists of tokens locked in KoalaSwap V3 liquidity pools.',
  unit0: { tvl, },
}
