const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x287fAE8c400603029c27Af0451126b9581B6fcD4'

module.exports = uniV3Export({
  astrzk: { factory: factory, fromBlock: 156301, },
});

