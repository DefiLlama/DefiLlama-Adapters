const { uniV3Export } = require('../helper/uniswapV3')

// ArkhamPad: memecoin launchpad on Elysium (Kinetiq's Hyperliquid L2, chain 99901).
// Every coin launches into its own Uniswap v3 style pool against WHYPE, created by ArkhamPad's factory,
// and the launch liquidity is locked forever. TVL = assets held in those pools.
module.exports = uniV3Export({
  elysium: { factory: '0x75656d8d2A59293DBdA4178F11Af6EE506ef60dD', fromBlock: 65264 },
})

module.exports.methodology = 'TVL is the value of tokens held in ArkhamPad launch pools (Uniswap v3 style pools created by the ArkhamPad factory on Elysium). Launch liquidity is locked forever.'
