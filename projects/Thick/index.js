const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  fantom:     { factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24', fromBlock: 70309749  },
  arbitrum :  { factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24', fromBlock: 148243463 },
  base :      { factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24', fromBlock: 6314325   },
  sonic:      { factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24', fromBlock: 444927    },
})
