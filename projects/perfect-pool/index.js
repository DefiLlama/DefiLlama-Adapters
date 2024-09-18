const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const NFT_ACE8 = '0x21F3ea812734b6492D88D268622CF068e9E6D596'

module.exports = {
  start: 1725311445,
  base: {
    tvl: sumTokensExport({ owner: NFT_ACE8, token: ADDRESSES.base.USDC }),
  }
}