const abis = {
  getAums: {
    inputs: [{ internalType: "bool", name: "maximise", type: "bool" }],
    name: "getAumInUsdg",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
};


module.exports = { abis }