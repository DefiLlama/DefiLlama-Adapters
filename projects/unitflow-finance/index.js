const { uniV3Export } = require('../helper/uniswapV3')
const { getUniTVL } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

// Unitflow v2.5 is a Uniswap v2 fork (pairs enumerated from the factory, no log scan needed),
// Unitflow v3 is a Uniswap v3 fork (pools discovered from the factory's PoolCreated events).
module.exports = mergeExports([
  { methodology: 'Token balances held in every Unitflow v2.5 pair (enumerated from the factory) and every Unitflow v3 pool (discovered from factory PoolCreated events).' },
  uniV3Export({ arc: { factory: '0x5bfBCeb73d39F722B1cB83fD2F11736b28c1Be6d', fromBlock: 21068735 } }),
  { arc: { tvl: getUniTVL({ factory: '0xFc1EC6761e246D5cb0c4C22669f8635098B22ba1', useDefaultCoreAssets: true }) } },
])
