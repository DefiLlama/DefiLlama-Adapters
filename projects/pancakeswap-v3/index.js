const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  bsc: { factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', fromBlock: 26956207, blacklistedTokens: [
    '0x860368babf32129c18306a70ce7db10c5b437072',
    '0xc476d3961f77645464acccce404eb17815a80878',
    '0xf8c7f403829cc0f9a37f126a3da41358c232acdf',
    '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1',
  ] },
  ethereum: { factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', fromBlock: 16950685, },
})
