/**
 * Hercules V3 — Metis TVL adapter
 *
 * Hercules is the primary concentrated liquidity DEX on Metis, using
 * Algebra CLMM. 65+ pools discovered via on-chain Pool event logs.
 *
 * Factory: 0xc5bfa92f27df36d268422ee314a1387bb5ffb06a (deploy block 9,073,593)
 */

'use strict'

const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  metis: {
    factory: '0xc5bfa92f27df36d268422ee314a1387bb5ffb06a',
    fromBlock: 9073593,
    isAlgebra: true,
  },
})
