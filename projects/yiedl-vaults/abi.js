const opsManagerAbi = {
  operationsCache: "function operationsCache() view returns (uint256, uint8, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
  portfolioRotationStartTimestamp: "uint256:portfolioRotationStartTimestamp",
  portfolioRotationEndTimestamp: "uint256:portfolioRotationEndTimestamp",
  processStartTimestamp: "uint256:processStartTimestamp",
  getFlatUsd: "function getFlatUsd() view returns (uint256)",
  getAeps: "function getAeps(address[] memory assets) view returns (uint256[] memory)",
  getPortfolioAddresses: "function getPortfolioAddresses(uint256 start, uint256 end) view returns (address[] memory)",
};

const opsHelperAbi = {
  getAssetValuesForPortfolio: "function getAssetValuesForPortfolio(address om, uint256 start, uint256 end) view returns (address[] memory assets, uint256[] memory values, int128[] memory sizes, uint256[] memory aeps, uint256[] memory prices, uint256 flatUsd, uint256 totalSupply)",
}

module.exports = { opsManagerAbi, opsHelperAbi };
