const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0x56CC5A9c0788e674f17F7555dC8D3e2F1C0313C0',
      tokens: [
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.fsGLP,
      ]
    })
  }
}