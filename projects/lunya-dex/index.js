const { uniV3Export } = require('../helper/uniswapV3')

// Lunya's factory emits its own PoolCreated, which indexes the pool type (0 concentrated,
// 1 constant-product, 2 stable) where Uniswap V3 indexes the fee, so it has a different topic0.
// The factory can emit Uniswap's shape as well, but only while the owner has enabled
// setCompatibilityEvent, so the adapter watches the event that is always emitted.
const poolCreated = {
  eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint8 indexed poolType, int24 tickSpacing, uint24 fee, address pool)',
  topics: ['0x3871766f55926cc6499881a4481d190672266d76354ee598765dea432553fac7'],
}

module.exports = {
  methodology: 'Counts the tokens held by every pool created by the Lunya factory. Balances are read from the pools directly rather than derived from liquidity, so the stable pools, whose reserves are not on the constant-product curve, are valued correctly.',
  ...uniV3Export({
    arc: { factory: '0x711492DF23F320745de6fD7f0ab9564FDBfeA016', fromBlock: 21067506, ...poolCreated },
  }),
}
