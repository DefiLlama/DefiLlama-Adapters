const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  base: {
    tvl: sumTokensExport(
      {
        tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
        owners: ['0x2f7c3cf9d9280b165981311b822becc4e05fe635', '0xf8192489A8015cA1690a556D42F7328Ea1Bb53D0']
      }
    )
  },
}
