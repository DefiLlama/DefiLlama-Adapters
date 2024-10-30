const ADDRESSES = require('../helper/coreAssets.json')
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  'real': { factory: '0xeF0b0a33815146b599A8D4d3215B18447F2A8101', fromBlock: 33062,}
})