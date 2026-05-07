const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

//base
const NFT_ACE8 = '0x21F3ea812734b6492D88D268622CF068e9E6D596'
const NFT_ACE16 = '0x70A254c8201adbD88d88D17937d5e8aBb8B8095F'
const NFT_CLUB_WORLD_CUP = '0x6b08888efd22d694504Bb293Cb135fD2Ea5f1fE4'
const PERFECT_POOL = '0x0a35174FB79C59F635204D4ae443D94B278742A8'

//hyperliquid EVM
const NFT_CLUB_WORLD_CUP_HYPERLIQUID = '0x9c0B8c13dBC4c8b72Bd2574f23592E0b3118Ab7c'
const NFT_ACE8_HYPERLIQUID = '0xe479875A08263c3a743B44c676Ed3bFC4457009B'
const NFT_ACE16_HYPERLIQUID = '0x568734E585Db3A3a583b9Ce11ddA91d099D3c6f2'

module.exports = {
  start: '2024-09-02',
  base: {
    tvl: sumTokensExport(
      { owners: [NFT_ACE8, NFT_ACE16, NFT_CLUB_WORLD_CUP, PERFECT_POOL], token: ADDRESSES.base.USDC },
    ),
  },
  hyperliquid: {
    tvl: sumTokensExport(
      { owners: [NFT_CLUB_WORLD_CUP_HYPERLIQUID, NFT_ACE8_HYPERLIQUID, NFT_ACE16_HYPERLIQUID], token: ADDRESSES.corn.USDT0 },
    ),
  }
}
