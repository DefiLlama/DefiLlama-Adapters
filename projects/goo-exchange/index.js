const sdk = require('@defillama/sdk')
const { uniV3Export } = require('../helper/uniswapV3')

// Uniswap V3 fork; pools are CREATE2'd by a separate pool deployer but PoolCreated is emitted by the factory
const publicPools = uniV3Export({
  robinhood: { factory: '0x221A6239E40709792b0d4bdc140fA36158CD41C7', fromBlock: 73266708 },
})

// satellite factory: same engine, but only the protocol's allowlisted arbitrage contracts can swap its pools
const satellitePools = uniV3Export({
  robinhood: { factory: '0x649Fee51B30dce68Eed7B356F5Ec6185e3982ADf', fromBlock: 79897550 },
})

module.exports = {
  start: '2026-09-26',
  methodology: 'Counts the tokens held by every pool of the goo exchange factory and of its satellite factory on Robinhood Chain, found from their PoolCreated events. Satellite pools run on the same engine, but only the protocol\'s arbitrage contracts can swap them: they hold protocol-owned GOO-paired liquidity, which those contracts trade against the public pools and outside markets.',
  robinhood: {
    tvl: sdk.util.sumChainTvls([publicPools.robinhood.tvl, satellitePools.robinhood.tvl]),
  },
}
