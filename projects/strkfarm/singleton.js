const Singleton = [
    {
        "name": "check_collateralization_unsafe",
        "type": "function",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::felt252"
          },
          {
            "name": "collateral_asset",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "debt_asset",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "(core::bool, core::integer::u256, core::integer::u256)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "check_collateralization",
        "type": "function",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::felt252"
          },
          {
            "name": "collateral_asset",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "debt_asset",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "(core::bool, core::integer::u256, core::integer::u256)"
          }
        ],
        "state_mutability": "external"
      },
      {
        "name": "position",
        "type": "function",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::felt252"
          },
          {
            "name": "collateral_asset",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "debt_asset",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "(core::integer::u256, core::integer::u256, core::integer::u256, core::integer::u256)"
          }
        ],
      },
      {
        "name": "vesu::data_model::Position",
        "type": "struct",
        "members": [
          {
            "name": "collateral_shares",
            "type": "core::integer::u256"
          },
          {
            "name": "nominal_debt",
            "type": "core::integer::u256"
          }
        ]
      },
  ]
  
  const SINGLETONabiMap = {}
  Singleton.forEach(i => SINGLETONabiMap[i.name] = i)
  
  module.exports = {
    SINGLETONabiMap
  }