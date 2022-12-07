module.exports = {
  artGobblers: {
    gooBalance: {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "gooBalance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  },
  goober: {
    reserves: {
      inputs: [],
      name: "getReserves",
      outputs: [
        { internalType: "uint256", name: "_gooReserve", type: "uint256" },
        { internalType: "uint256", name: "_gobblerReserve", type: "uint256" },
        { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
      ],
      stateMutability: "view",
      type: "function",
    },
  },
};
