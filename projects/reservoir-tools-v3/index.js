const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  'abstract': { factory: '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1', fromBlock: 1 },
  'zero_network': { factory: '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1', fromBlock: 1 },
  'shape': { factory: '0xeCf9288395797Da137f663a7DD0F0CDF918776F8', fromBlock: 1 },
  'redstone': { factory: '0xece75613Aa9b1680f0421E5B2eF376DF68aa83Bb', fromBlock: 1 },
  'ink': { factory: '0x640887A9ba3A9C53Ed27D0F7e8246A4F933f3424', fromBlock: 1 },
})