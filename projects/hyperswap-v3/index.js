const ADDRESSES = require('../helper/coreAssets.json')
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: { 
    factory: '0xB1c0fa0B789320044A6F623cFe5eBda9562602E3', 
    fromBlock: 1, 
    blacklistedTokens: [ // cause failures 
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0xdac17f958d2ee523a2206206994597c13d831ec7', 
      '0x6b175474e89094c44da98b954eedeac495271d0f'
    ] 
  },
})