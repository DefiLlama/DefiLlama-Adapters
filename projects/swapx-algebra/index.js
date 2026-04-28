/**
 * SwapX Algebra — Sonic TVL adapter
 *
 * SwapX is a concentrated liquidity DEX on Sonic using Algebra CLMM.
 * Factory deployed at block 1,897,950; 26+ pools.
 *
 * Factory: 0x8121a3f8c4176e9765deea0b95fa2bdfd3016794
 */

'use strict'

const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  sonic: {
    factory: '0x8121a3f8c4176e9765deea0b95fa2bdfd3016794',
    fromBlock: 1897950,
    isAlgebra: true,
  },
})
