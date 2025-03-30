const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: { factory: '0xB1c0fa0B789320044A6F623cFe5eBda9562602E3', fromBlock: 1, },
})

// Please review this issue: `https://github.com/DefiLlama/DefiLlama-Adapters/issues/14004`
