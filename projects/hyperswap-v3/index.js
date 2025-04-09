const ADDRESSES = require('../helper/coreAssets.json')
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: { 
    factory: '0xB1c0fa0B789320044A6F623cFe5eBda9562602E3', 
    fromBlock: 1, 
    blacklistedTokens: [ // cause failures 
      ADDRESSES.ethereum.USDC, 
      ADDRESSES.ethereum.USDT
    ] 
  },
})