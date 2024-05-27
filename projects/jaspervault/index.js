const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0xE980FD1dEA4E93c25B7f5B27351CF069C4f63a41', // sell ETH CALL
        '0xE26f15B3cc23e8a5adE4c10CCc69e50520eE2a89', // sell ETH PUT
        '0xaaa5a76b9397eE41309CC15Bd71a5ae99662d6cd', // sell WBTC CALL
        '0xd9344b56AE4C3Eb40a248c2548F128cCcd6208A0'  // sell WBTC PUT
      ],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.null, ADDRESSES.arbitrum.USDT]
    })
  },
}
