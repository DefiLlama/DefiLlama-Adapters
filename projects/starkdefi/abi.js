const fabis = [
    {
      type: "function",
      name: "all_pairs",
      inputs: [],
      outputs: [
        {
          type: "(core::integer::u32, core::array::Array::<core::starknet::contract_address::ContractAddress>)",
        },
      ],
      state_mutability: "view",
    },
  ];
  
  const pabistructs = [
    {
      type: "struct",
      name: "starkDefi::dex::v1::pair::interface::Snapshot",
      members: [
        {
          name: "token0",
          type: "core::starknet::contract_address::ContractAddress",
        },
        {
          name: "token1",
          type: "core::starknet::contract_address::ContractAddress",
        },
        { name: "decimal0", type: "core::integer::u256" },
        { name: "decimal1", type: "core::integer::u256" },
        { name: "reserve0", type: "core::integer::u256" },
        { name: "reserve1", type: "core::integer::u256" },
        { name: "is_stable", type: "core::bool" },
        { name: "fee_tier", type: "core::integer::u8" },
      ],
    },
  ];
  const pabis = [
    {
      type: "function",
      name: "snapshot",
      inputs: [],
      outputs: [{ type: "starkDefi::dex::v1::pair::interface::Snapshot" }],
      state_mutability: "view",
    },
  ];
  
  const factory = {};
  const pair = {};
  fabis.forEach((i) => (factory[i.name] = i));
  pabis.forEach((i) => (pair[i.name] = i));
  
  module.exports = {
    factory,
    pair,
    fabis,
    pabis,
    pabistructs,
  };
  