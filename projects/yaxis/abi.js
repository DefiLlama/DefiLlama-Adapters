const abi = {
  yAxisBar: {
    name: "availableBalance",
    inputs: [],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  yAxisMetaVault: {
    name: "balance",
    inputs: [],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  votingEscrow: {
    name: "supply",
    inputs: [],
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  vault: {
    inputs: [],
    name: "balanceOfThis",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

module.exports = { abi };
