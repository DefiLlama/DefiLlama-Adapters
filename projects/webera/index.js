const { sumERC4626VaultsExport } = require('../helper/erc4626')
const vaults = [
  '0x55a050f76541C2554e9dfA3A0b4e665914bF92EA',
  '0x4eAD3867554E597C7B0d511dC68ceaD59286870D',
]

module.exports = {
  berachain: {
    tvl: sumERC4626VaultsExport({ vaults, isOG4626: true })
  },
  start: '2025-02-18',  // 18/02/2025 @ 00:00am (UTC)
}