/**
 * Shadow Exchange CLMM — Sonic TVL adapter
 *
 * Shadow Exchange is a concentrated liquidity DEX on Sonic mainnet
 * using an Algebra-style CLMM. Factory deployed at block 571,850;
 * 43+ pools including SHADOW, wS, USDC, WETH pairs.
 *
 * Factory: 0xb860200bd68dc39ceafd6ebb82883f189f4cda76
 */

'use strict'

const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  sonic: {
    factory: '0xb860200bd68dc39ceafd6ebb82883f189f4cda76',
    fromBlock: 571850,
    isAlgebra: true,
  },
})
