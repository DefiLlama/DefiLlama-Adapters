const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0xE980FD1dEA4E93c25B7f5B27351CF069C4f63a41', // sell WBTC & ETH CALL
        '0xE26f15B3cc23e8a5adE4c10CCc69e50520eE2a89'  // sell WBTC & ETH PUT
      ],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.null, ADDRESSES.arbitrum.USDT]
    })
  },
}
