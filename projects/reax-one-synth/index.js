const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  deadFrom: '2024-10-08',
  mantle: {
    tvl: sumTokensExport({
      owner: '0x78B2fa94A94bF3E96fcF9CE965bed55bE49FA9E7',
      tokens: [
        ADDRESSES.mantle.WETH,
        ADDRESSES.mantle.USDT,
        '0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2',
        ADDRESSES.mantle.WMNT,
        ADDRESSES.mantle.USDC

      ]
    }),
  }
}
