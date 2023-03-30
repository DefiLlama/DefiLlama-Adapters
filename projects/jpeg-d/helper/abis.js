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

const ERC721 = {
  tokenOfOwnerByIndex:
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
};

const PROVIDER_ABI = {
  "nftType": "function nftTypes(uint256) view returns (bytes32)",
  "nftTypeValueMultiplier": "function nftTypeValueMultiplier(bytes32) view returns (uint128 numerator, uint128 denominator)"
}

module.exports = {
  VAULT_ABI,
  PROVIDER_ABI,
  STRATEGY_ABI,
  APE_STAKING,
  ERC721,
};
