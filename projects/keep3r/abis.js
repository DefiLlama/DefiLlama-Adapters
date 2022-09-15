exports.abis = {
  userInfo: {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardDebt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  totalBorrows: {
    constant: true,
    inputs: [],
    name: "totalBorrows",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },

  priceRegistry: {
    constant: true,
    inputs: [{ name: "_forex", type: "address" }],
    name: "price",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },

  totalSupply: {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "totalSupply", type: "uint256" }],
    type: "function",
  },

  getReserves: {
    constant: true,
    inputs: [],
    name: "getReserves",
    outputs: [{ name: "_reserve0", type: "uint112"}, { name: "_reserve1", type: "uint112"}, { name: "_blockTimestampLast", type: "uint32"} ]
  }
};
