const DHEDGE_FACTORY_ABI = {
  inputs: [
    {
      internalType: "address",
      name: "manager",
      type: "address",
    },
  ],
  name: "getManagedPools",
  outputs: [
    {
      internalType: "address[]",
      name: "managedPools",
      type: "address[]",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const TOROS_POOL_ABI = {
  inputs: [],
  name: "getFundSummary",
  outputs: [
    {
      components: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "totalSupply",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalFundValue",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "manager",
          type: "address",
        },
        {
          internalType: "string",
          name: "managerName",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "creationTime",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "privatePool",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "performanceFeeNumerator",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "managerFeeNumerator",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "managerFeeDenominator",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "exitFeeNumerator",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "exitFeeDenominator",
          type: "uint256",
        },
      ],
      internalType: "struct PoolLogic.FundSummary",
      name: "",
      type: "tuple",
    },
  ],
  stateMutability: "view",
  type: "function",
};

module.exports = {
  DHEDGE_FACTORY_ABI,
  TOROS_POOL_ABI,
};
