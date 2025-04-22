const { uniV3Export } = require('../helper/uniswapV3')
module.exports = uniV3Export({
  astrzk: { factory: '0x350B0F09EE6659e18a2642d6B25b909d59271e3c', fromBlock: 177553, },
})

module.exports.deadFrom = '2025-03-31'  // Astar ZK is shutting down on March 31, 2025: https://docs.astar.network/docs/learn/zkEVM
