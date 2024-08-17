const ERC721StratAbi = [
  {
    "name": "get_settings",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "fee_percent",
        "type": "core::integer::u128"
      },
      {
        "name": "fee_receiver",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "min_health_factor",
        "type": "core::integer::u32"
      },
      {
        "name": "target_health_factor",
        "type": "core::integer::u32"
      },
      {
        "name": "coefs_sum1",
        "type": "core::integer::u128"
      },
      {
        "name": "coefs_sum2",
        "type": "core::integer::u128"
      }
    ],
    "state_mutability": "view"
  }
]

const ERC721StratAbiMap = {}
ERC721StratAbi.forEach(i => ERC721StratAbiMap[i.name] = i)

module.exports = {
  ERC721StratAbiMap
}