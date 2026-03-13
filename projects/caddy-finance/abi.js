const u256Struct = {
  type: "struct",
  name: "core::integer::u256",
  members: [
    { name: "low", type: "core::integer::u128" },
    { name: "high", type: "core::integer::u128" }
  ]
}

const positionStruct = {
  type: "struct",
  name: "vesu::data_model::Position",
  members: [
    {
      name: "collateral_shares",
      type: "core::integer::u256"
    },
    {
      name: "nominal_debt",
      type: "core::integer::u256"
    }
  ]
}

const positionABI = {
  name: "position",
  type: "function",
  inputs: [
    {
      name: "collateral_asset",
      type: "core::starknet::contract_address::ContractAddress"
    },
    {
      name: "debt_asset",
      type: "core::starknet::contract_address::ContractAddress"
    },
    {
      name: "user",
      type: "core::starknet::contract_address::ContractAddress"
    }
  ],
  outputs: [
    {
      type: "(vesu::data_model::Position, core::integer::u256, core::integer::u256)"
    }
  ],
  state_mutability: "view",

  customInput: 'address'
}

module.exports = {
  positionABI,
  positionStruct,
  u256Struct,
}
