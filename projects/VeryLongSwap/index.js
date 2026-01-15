const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x287fAE8c400603029c27Af0451126b9581B6fcD4'

module.exports = uniV3Export({
  astrzk: { factory: factory, fromBlock: 156301, },
});

module.exports.deadFrom = '2025-03-31'  // Astar ZK is shutting down on March 31, 2025: https://docs.astar.network/docs/learn/zkEVM
