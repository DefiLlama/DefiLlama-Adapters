const ADDRESSES = require('../helper/coreAssets.json')

const CHAIN_TOKENS = {
  optimism: {
    USDC: ADDRESSES.optimism.USDC_CIRCLE,
    ETH: ADDRESSES.optimism.WETH_1,
    WETH: ADDRESSES.optimism.WETH,
    USDCe: ADDRESSES.optimism.USDC,
    DAI: ADDRESSES.optimism.DAI,
    USDT: ADDRESSES.optimism.USDT,
    OP: ADDRESSES.optimism.OP,
    THALES: '0x217d47011b23bb961eb6d93ca9945b7501a5bb11',
    OVERTIME: '0xedf38688b27036816a50185caa430d5479e1c63e'
  },
  arbitrum: {
    USDCe: ADDRESSES.arbitrum.USDC,
    USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
    DAI: ADDRESSES.arbitrum.DAI,
    USDT: ADDRESSES.arbitrum.USDT,
    ARB: ADDRESSES.arbitrum.ARB,
    WBTC: ADDRESSES.arbitrum.WBTC,
    WETH: ADDRESSES.arbitrum.WETH,
    THALES: '0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30',
    OVERTIME: '0x5829d6fe7528bc8e92c4e81cc8f20a528820b51a'
  },
  polygon: {
    USDCe: ADDRESSES.polygon.USDC,
  },
  base: {
    USDC: ADDRESSES.base.USDC,
    USDbC: ADDRESSES.base.USDbC,
    DAI: ADDRESSES.base.DAI,
    USDT: ADDRESSES.base.USDT,
    WETH: ADDRESSES.base.WETH,
    cbBTC: ADDRESSES.base.cbBTC,
    THALES: '0xf34e0cff046e154cafcae502c7541b9e5fd8c249',
    OVERTIME: '0x7750c092e284e2c7366f50c8306f43c7eb2e82a2'
  },
  ethereum: {
    OVERTIME: '0x90ce5720c17587d28e4af120ae2d313b3bad1722'
  }
}

module.exports = CHAIN_TOKENS