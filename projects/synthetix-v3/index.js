const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  base: {
    tvl: sumTokensExport({ owner: '0x32C222A9A159782aFD7529c87FA34b96CA72C696', tokens: [ADDRESSES.base.USDC] })
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xffffffaEff0B96Ea8e4f94b2253f31abdD875847', tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDe] })
  }
}
