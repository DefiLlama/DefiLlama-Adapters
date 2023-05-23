const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  bsc: { factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', fromBlock: 26956207, blacklistedTokens: [
    '0x860368babf32129c18306a70ce7db10c5b437072',
    '0xc476d3961f77645464acccce404eb17815a80878',
  ] },
  ethereum: { factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', fromBlock: 16950685, },
})
