module.exports = {
  assetToken1: "function assetToken1() view returns (address)",
  estimatedValueIntoken1: "function estimatedValueInToken1() view returns (uint256 value1)",
  getAssets: "function getAssets() view returns (address[])",
  getAssetsBalance: "function getAssetsBalance() view returns (uint256[])",
  assetType: "function assetType(address) external returns (uint8)",
  underlyingAsset: "function UNDERLYING_ASSET_ADDRESS() returns (address)",
  asset_token0: {
    type: "function",
    state_mutability: "view",
    name: "asset_token0",
    inputs: [],
    outputs: [{ name: "address", type: "felt" }],
    customType: "address",
  },
  estimated_value_in_token0: {
    type: "function",
    state_mutability: "view",
    name: "estimated_value_in_token0",
    inputs: [],
    outputs: [{ name: "value", type: "Uint256" }],
  },
};
