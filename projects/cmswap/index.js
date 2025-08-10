const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  jbc: { factory: '0x5835f123bDF137864263bf204Cf4450aAD1Ba3a7', fromBlock: 4990175, },
  bitkub: { factory: '0x090C6E5fF29251B1eF9EC31605Bdd13351eA316C', fromBlock: 25033350, },
})
