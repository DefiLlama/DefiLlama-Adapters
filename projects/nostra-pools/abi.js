const factoryAbi = [
  {
    name: "all_pairs",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::array::Array::<core::starknet::contract_address::ContractAddress>",
      },
    ],
    state_mutability: "view",
  },
];

const pairAbi = [
  {
    name: "core::integer::u256",
    type: "struct",
    members: [
      {
        name: "low",
        type: "core::integer::u128",
      },
      {
        name: "high",
        type: "core::integer::u128",
      },
    ],
  },
  {
    name: "token_0",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    state_mutability: "view",
  },
  {
    name: "token_1",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    state_mutability: "view",
  },
  {
    name: "get_reserves",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "(core::integer::u256, core::integer::u256)",
      },
    ],
    state_mutability: "view",
  },
];

const factory = {};
const pair = {};
factoryAbi.forEach((i) => (factory[i.name] = i));
pairAbi.forEach((i) => (pair[i.name] = i));

module.exports = {
  factory,
  pair,
  factoryAbi,
  pairAbi,
};
