const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  fluent: {
    factory: '0x69Be606be7Fd2d27C8f9821329c748c77d24FF4f',
    fromBlock: 2189672,
  },
})

module.exports.methodology = 'TVL counts liquidity locked in FluxFlow V3 pools on Fluent. PoolCreated events are read from the factory and reserves of each pool are summed.'
