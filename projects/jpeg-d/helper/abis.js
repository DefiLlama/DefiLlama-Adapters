const VAULT_ABI = {
  totalPositions: "uint256:totalPositions",
  nftValueProvider: "address:nftValueProvider",
  positionOwner: {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "positionOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  openPositionIndices:
    "function openPositionsIndexes() external view returns (uint256[] memory)",
};

const STRATEGY_ABI = {
  depositAddress:
    "function depositAddress(address) external view returns (address)",
  isDeposited:
    "function isDeposited(address, uint256) external view returns (bool)",
};

const APE_STAKING = {
  stakedTotal: "function stakedTotal(address) external view returns (uint256)",
};

const ERC721 = {
  tokenOfOwnerByIndex:
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
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
  STRATEGY_ABI,
  APE_STAKING,
  ERC721,
};
