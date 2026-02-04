const { uniV3Export } = require('../helper/uniswapV3')

module.exports = {
  ...uniV3Export({
    scroll: {
      factory: '0x1d25AF2b0992bf227b350860Ea80Bad47382CAf6',
      fromBlock: 14223999
    },
  })
}
