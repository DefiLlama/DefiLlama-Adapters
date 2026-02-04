const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  bsquared: { factory: '0x02eAFbE9dE030f69aF02B7D3F2f69B28016f3C83', fromBlock: 1, blacklistedTokens: ['0x796e4d53067ff374b89b2ac101ce0c1f72ccaac2'] },
})