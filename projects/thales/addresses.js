const ADDRESSES = require('../helper/coreAssets.json')

const CHAIN_TOKENS = {
  optimism: {
    USDC: ADDRESSES.optimism.USDC_CIRCLE,
    ETH: ADDRESSES.optimism.WETH_1,
    WETH: ADDRESSES.optimism.WETH,
    THALES: '0x217d47011b23bb961eb6d93ca9945b7501a5bb11'
  },
  arbitrum: {
    USDC: ADDRESSES.arbitrum.USDC,
    WETH: ADDRESSES.arbitrum.WETH,
    THALES: '0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30'
  },
  polygon: {
    USDC: ADDRESSES.polygon.USDC
  },
  base: {
    USDC: ADDRESSES.base.USDbC,
    WETH: ADDRESSES.base.WETH,
    THALES: '0xf34e0cff046e154cafcae502c7541b9e5fd8c249'
  }
}

module.exports = CHAIN_TOKENS
