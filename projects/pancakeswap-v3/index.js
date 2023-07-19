const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  bsc: { factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', fromBlock: 26956207, blacklistedTokens: [
    '0x860368babf32129c18306a70ce7db10c5b437072',
    '0xc476d3961f77645464acccce404eb17815a80878',
    '0xf8c7f403829cc0f9a37f126a3da41358c232acdf',
    '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1',
    '0x454f4597582df557c2757403f47d3f3bbb890d43',
    '0x121a3fba8456ebce13964363ba35fea00c2aa3d2',
  ] },
  ethereum: { factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865', fromBlock: 16950685, },
  polygon_zkevm: { factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865', fromBlock: 750148, },
})
