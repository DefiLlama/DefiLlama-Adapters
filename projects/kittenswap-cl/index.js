const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: { 
    factory: '0x2E08F5Ff603E4343864B14599CAeDb19918BDCaF', 
    fromBlock: 2033100, 
    eventAbi: "event PoolCreated(address indexed token0, address indexed token1, int24 indexed tickSpacing, address pool)",
    topics: ['0xab0d57f0df537bb25e80245ef7748fa62353808c54d6e528a9dd20887aed9ac2'],
  },
})