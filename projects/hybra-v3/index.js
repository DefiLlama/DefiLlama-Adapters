const { uniV3Export } = require('../helper/uniswapV3')
const { withMonetrixBalances } = require('../helper/monetrix')

const adapter = uniV3Export({
  hyperliquid: {
    factory: '0x2dC0Ec0F0db8bAF250eCccF268D7dFbF59346E5E',
    fromBlock: 6523521,
    permitFailure: true,
    sumChunkSize: 50,
    sumChunkSleep: 200,
  },
  robinhood: {
    factory: '0xCeFc5Da47d766Fb6b48Da92D75d66b3264593d0f',
    fromBlock: 58245132,
  },
})

adapter.hyperliquid.tvl = withMonetrixBalances(adapter.hyperliquid.tvl)
adapter.misrepresentedTokens = true
adapter.methodology = 'Token balances held by liquidity pools. On Hyperliquid, sUSDM and smxHYPE are converted to USDM and mxHYPE with convertToAssets, then represented as their 1:1 standard redemption assets USDC and HYPE (WHYPE for pricing).'

module.exports = adapter
