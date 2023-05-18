const VAULT_ABI = {
  totalPositions: "uint256:totalPositions",
  nftValueProvider: "address:nftValueProvider",
  positionOwner: "function positionOwner(uint256) view returns (address)",
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

const P2P_APE_STAKING_ABI = {
  nextNonce: "function nextNonce() external view returns (uint256)",
  offers: {
    inputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    name: "offers",
    outputs: [
      {
        internalType: "enum ApeMatchingMarketplace.OfferType",
        name: "offerType",
        type: "uint8",
      },
      {
        components: [
          {
            internalType: "enum ApeStakingLib.Collections",
            name: "collection",
            type: "uint8",
          },
          {
            internalType: "uint16",
            name: "tokenId",
            type: "uint16",
          },
        ],
        internalType: "struct ApeMatchingMarketplace.MainNFT",
        name: "mainNft",
        type: "tuple",
      },
      {
        internalType: "uint16",
        name: "bakcTokenId",
        type: "uint16",
      },
      {
        internalType: "uint80",
        name: "apeAmount",
        type: "uint80",
      },
      {
        internalType: "uint16",
        name: "apeRewardShareBps",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "bakcRewardShareBps",
        type: "uint16",
      },
      {
        internalType: "bool",
        name: "isPaired",
        type: "bool",
      },
      {
        internalType: "uint80",
        name: "lastSingleStakingRewardPerShare",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

const ERC721 = {
  tokenOfOwnerByIndex:
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
};

const PROVIDER_ABI = {
  nftType: "function nftTypes(uint256) view returns (bytes32)",
  nftTypeValueMultiplier:
    "function nftTypeValueMultiplier(bytes32) view returns (uint128 numerator, uint128 denominator)",
};

module.exports = {
  VAULT_ABI,
  P2P_APE_STAKING_ABI,
  PROVIDER_ABI,
  STRATEGY_ABI,
  APE_STAKING,
  ERC721,
};
