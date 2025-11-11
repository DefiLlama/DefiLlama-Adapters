const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  arbitrum: { factory: '0xaa2cd7477c451e703f3b9ba5663334914763edf8', fromBlock: 90593047, },
  hyperliquid: { factory: '0xA87c8308722237F6442Ef4762B7287afB84fB191', fromBlock: 6947040, },
})