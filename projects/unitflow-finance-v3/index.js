const { uniV3Export } = require('../helper/uniswapV3')

// Unitflow v3 is a Uniswap v3 fork; pools are discovered from the factory's PoolCreated events.
module.exports = {
  methodology: 'Token balances held in every Unitflow v3 pool, discovered from the factory PoolCreated events.',
  ...uniV3Export({ arc: { factory: '0x5bfBCeb73d39F722B1cB83fD2F11736b28c1Be6d', fromBlock: 21068735 } }),
}
