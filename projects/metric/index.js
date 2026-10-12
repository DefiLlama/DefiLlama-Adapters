const { getLogs2 } = require('../helper/cache/getLogs')

// Metric's first-generation MetricOmmPoolFactory (CreateX, same address on every
// chain). Pools are discovered from its PoolCreated events; each pool holds its
// own token0/token1 reserves, so TVL is the sum of both balances per pool.
// The previous version of this adapter read the pool list from a Metric API that
// has since been shut down; the on-chain scan replaces it 1:1.
//   https://etherscan.io/address/0xe22F9fc0f04486dE25ed6CF1800a4a47aFD82e0C
//   https://basescan.org/address/0xe22F9fc0f04486dE25ed6CF1800a4a47aFD82e0C
const FACTORY = '0xe22F9fc0f04486dE25ed6CF1800a4a47aFD82e0C'

const POOL_CREATED_EVENT = 'event PoolCreated(address indexed token0, address indexed token1, address indexed priceProvider, address pool, bytes32 poolId)'

// fromBlock = factory deployment block per chain; the same values drive the
// volume adapter for this factory (DefiLlama/dimension-adapters, dexs/metric).
const config = {
  ethereum: { fromBlock: 24521317 },
  base: { fromBlock: 42570144 },
  arbitrum: { fromBlock: 435210755 },
  bsc: { fromBlock: 82964761 },
  avax: { fromBlock: 78822864 },
  polygon: { fromBlock: 83380134 },
  megaeth: { fromBlock: 9083666 },
  hyperliquid: { fromBlock: 30774348 },
  monad: { fromBlock: 64807339 },
  robinhood: { fromBlock: 9477535 },
}

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, target: FACTORY, eventAbi: POOL_CREATED_EVENT, fromBlock })
      const ownerTokens = logs.map(({ token0, token1, pool }) => [[token0, token1], pool])
      return api.sumTokens({ ownerTokens })
    },
  }
})

module.exports.methodology = 'TVL is the sum of token0 and token1 balances held by every pool created by the Metric pool factory. Pools are discovered on-chain from the factory PoolCreated events.'
