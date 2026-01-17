const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  pepu: {
    factory: '0x5984B8BF2d4dB9C0aCB1d7924762e4474D80C807',
    fromBlock: 20,
    blacklistedTokens: [
      '0x411caba7dd4c4653ebd5fbba4406855859e21485',
    ]
  },
})
