// OwlSwap V3: concentrated-liquidity AMM (Uniswap V3 interface) on BNB Chain.
// TVL = the tokens held by every pool created by the OwlSwap factory.
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  bsc: { factory: '0x8d33DA172e5A27C9661286Ef1c9740de87Aa2F7B', fromBlock: 131000000 },
})
