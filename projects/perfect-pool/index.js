const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const NFT_ACE8 = '0x21F3ea812734b6492D88D268622CF068e9E6D596'
const NFT_ACE16 = '0x70A254c8201adbD88d88D17937d5e8aBb8B8095F'

module.exports = {
  start: 1725311445,
  base: {
    tvl: sumTokensExport(
      { owners: [NFT_ACE8, NFT_ACE16], token: ADDRESSES.base.USDC },
    ),
  }
}