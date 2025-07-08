const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x57eF21959CF9536483bA6ddB10Ad73E2a06b85ff'

module.exports = uniV3Export({
  blast: { factory, fromBlock: 207530, permitFailure: true,  },
})