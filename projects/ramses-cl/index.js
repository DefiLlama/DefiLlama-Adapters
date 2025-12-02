const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  arbitrum: { factory: '0xaa2cd7477c451e703f3b9ba5663334914763edf8', fromBlock: 90593047, },
  hyperliquid: { factory: '0x07E60782535752be279929e2DFfDd136Db2e6b45', fromBlock: 17985840, },
})
