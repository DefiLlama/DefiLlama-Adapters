const { uniV3Export } = require('../helper/uniswapV3')

/**
 * @typedef {Object} SilverSwapInfo
 * @property {string} factory - Hex address of the factory contract
 * @property {number} fromBlock - Block to start indexing. Should precede the
 *   deployment block by at least 1.
 * @property {boolean} isAlgebra - Defaults to true. SilverSwap is based on
 *   Algebra's DEX model.
 */

/**
 * Config object mapping chain names to SilverSwap deployment information.
 *
 * @type {Object.<string, SilverSwapInfo>}
 */
const silverswap = {
  sonic: {
    factory: '0xb860200BD68dc39cEAfd6ebb82883f189f4CdA76',
    fromBlock: 186117,
    isAlgebra: true,
  },
  nibiru: {
    factory: '0xb860200BD68dc39cEAfd6ebb82883f189f4CdA76',
    fromBlock: 19674297,
    isAlgebra: true,
  },
}

module.exports = uniV3Export(silverswap)
