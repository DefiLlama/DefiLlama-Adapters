const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')


module.exports = {
  timetravel: false,
  zksync: {
    offers: () => ({}),
    tvl: async () => ({})
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xf4037f59c92c9893c43c2372286699430310cfe7', tokens: [
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.WBTC,
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.LINK,
    ]})
  }
}
