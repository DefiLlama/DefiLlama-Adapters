module.exports = {
  inputs: [],
  name: "getPublicPoolsWithData",
  outputs: [
    {
      internalType: "uint256[]",
      name: "",
      type: "uint256[]",
    },
    {
      components: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "address",
          name: "comptroller",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "blockPosted",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "timestampPosted",
          type: "uint256",
        },
      ],
      internalType: "struct FusePoolDirectory.FusePool[]",
      name: "",
      type: "tuple[]",
    },
    {
      internalType: "uint256[]",
      name: "",
      type: "uint256[]",
    },
    {
      internalType: "uint256[]",
      name: "",
      type: "uint256[]",
    },
    {
      internalType: "address[][]",
      name: "",
      type: "address[][]",
    },
    {
      internalType: "string[][]",
      name: "",
      type: "string[][]",
    },
    {
      internalType: "bool[]",
      name: "",
      type: "bool[]",
    },
  ],
  stateMutability: "nonpayable",
  type: "function",
};
