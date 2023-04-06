const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  ethereum: { factory: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F', fromBlock: 16955547, },
  arbitrum: { factory: '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e', fromBlock: 75998697, },
  optimism: { factory: '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0', fromBlock: 85432013, },
  polygon: { factory: '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2', fromBlock: 41024971, },
})

