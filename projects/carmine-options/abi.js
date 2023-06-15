const abi = [
  {
    inputs: [
      {
        name: "lptoken_address",
        type: "felt",
      },
    ],
    name: "get_unlocked_capital",
    outputs: [
      {
        name: "unlocked_capital",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "lptoken_address",
        type: "felt",
      },
    ],
    name: "get_value_of_pool_position",
    outputs: [
      {
        name: "res",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const objAbi = {};

abi.forEach((i) => (objAbi[i.name] = i));

module.exports = objAbi;
