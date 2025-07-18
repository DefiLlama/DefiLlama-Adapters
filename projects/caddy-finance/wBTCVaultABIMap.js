const wBTCVault = [
  {
    "kind": "struct",
    "name": "caddy_finance_contracts::bitcoin_vault::BitcoinVault::BulkCollateralWithdrawn",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "total_amount",
        "type": "core::integer::u256"
      },
      {
        "kind": "data",
        "name": "cycle_ids",
        "type": "core::array::Array::<core::integer::u64>"
      }
    ]
  },
]
  
  const wBTCVaultABIMap = {}
  wBTCVault.forEach(i => wBTCVaultABIMap[i.name] = i)
  
  module.exports = {
    wBTCVaultABIMap
  }