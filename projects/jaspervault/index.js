const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0xE980FD1dEA4E93c25B7f5B27351CF069C4f63a41', // sell WBTC ETH CALL & PUT
      ],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.null, ADDRESSES.arbitrum.USDT]
    })
  },
}
