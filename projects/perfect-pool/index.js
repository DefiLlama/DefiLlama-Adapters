const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

//base
const NFT_ACE8 = '0x21F3ea812734b6492D88D268622CF068e9E6D596'
const NFT_ACE16 = '0x70A254c8201adbD88d88D17937d5e8aBb8B8095F'
const NFT_CLUB_WORLD_CUP = '0x6b08888efd22d694504Bb293Cb135fD2Ea5f1fE4'
const PERFECT_POOL = '0x0a35174FB79C59F635204D4ae443D94B278742A8'

//hyperliquid EVM
const NFT_CLUB_WORLD_CUP_HYPERLIQUID = '0x9c0B8c13dBC4c8b72Bd2574f23592E0b3118Ab7c'

module.exports = {
  start: '2024-09-02',
  base: {
    tvl: sumTokensExport(
      { owners: [NFT_ACE8, NFT_ACE16, NFT_CLUB_WORLD_CUP, PERFECT_POOL], token: ADDRESSES.base.USDC },
    ),
  },
  hyperliquid: {
    tvl: sumTokensExport(
      { owners: [NFT_CLUB_WORLD_CUP_HYPERLIQUID], token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb" },
    ),
  }
}
