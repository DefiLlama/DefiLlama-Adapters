const { uniV3Export } = require('../helper/uniswapV3');

module.exports = {
  methodology: 'Counts liquidity in Oku V3 pools.',
  ...uniV3Export({
    '0g': {
      factory: '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
      fromBlock: 6674380,
    },
  }),
};
