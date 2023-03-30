const VAULT_ABI = {
  totalPositions: "uint256:totalPositions",
  nftValueProvider: "address:nftValueProvider",
  positionOwner: "address:positionOwner",
  openPositionIndices:
    "function openPositionsIndexes() external view returns (uint256[] memory)",
};

const PROVIDER_ABI = {
  nftType: {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "nftTypes",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  nftTypeValueMultiplier: {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "nftTypeValueMultiplier",
    outputs: [
      {
        internalType: "uint128",
        name: "numerator",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "denominator",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

module.exports = {
  VAULT_ABI,
  PROVIDER_ABI,
};
