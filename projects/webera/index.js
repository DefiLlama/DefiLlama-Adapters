const { sumERC4626VaultsExport } = require('../helper/erc4626')
const vaults = [
  '0x55a050f76541C2554e9dfA3A0b4e665914bF92EA', // $WBERA Vault
  '0x4eAD3867554E597C7B0d511dC68ceaD59286870D', // $HONEY Vault
  '0xCf1bfB3F9dc663F6775f999239E646e0021CCc0B', // $WBERA LST Vault
  '0x396A3D0B799B1a0B1EaA17e75B4DEa412400860b', // $IBERA Vault
  '0xc06B9E2a936A656c13df32a6504C8422189203CE', // $WGBERA Vault
]

module.exports = {
  berachain: {
    tvl: sumERC4626VaultsExport({ vaults, isOG4626: true })
  },
  start: '2025-02-18',  // 18/02/2025 @ 00:00am (UTC)
}